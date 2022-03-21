import { Duration } from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

import { CleanupFunction } from './cleanup-function';
import { CredentialsRotatorFunction } from './credentials-rotator-function';
import { EventHandlerFunction } from './event-handler-function';

export interface IIamCredentialsRotatorProps {
  /**
   * Lambda function which is invoked after new credentials are created for a user
   */
  readonly credentialsHandler: IFunction;
  /**
   * List of IAM usernames in target account
   */
  readonly usernames: string[];
  /**
   * Frequency of key rotation. Default once an hour.
   */
  readonly scheduleDuration?: Duration;
}

export class IamCredentialsRotator extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: IIamCredentialsRotatorProps,
  ) {
    super(scope, id);

    // Step 1
    const credentialsRotatorLambda = new CredentialsRotatorFunction(
      this,
      'CredentialsRotatorLambda',
      {
        environment: {
          SECRET_NAME_PREFIX: id.toLowerCase(),
        },
      },
    );
    credentialsRotatorLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'iam:ListAccessKeys',
          'iam:CreateAccessKey',
          'iam:DeleteAccessKey',
          'secretsmanager:CreateSecret',
        ],
        resources: ['*'],
      }),
    );

    const credentialsRotatorLambdaTask = new tasks.LambdaInvoke(
      this,
      'CredentialsRotatorLambdaTask',
      {
        lambdaFunction: credentialsRotatorLambda,
      },
    );

    // Step 2
    props.credentialsHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          'arn:*:secretsmanager:*:*:secret:iam-credential-rotation/*',
        ],
      }),
    );

    const credentialsHandlerLambdaTask = new tasks.LambdaInvoke(
      this,
      'CredentialsHandlerLambdaTask',
      {
        lambdaFunction: props.credentialsHandler,
        resultPath: sfn.JsonPath.DISCARD,
        inputPath: '$.Payload',
      },
    );

    // Step 3
    const cleanupLambda = new CleanupFunction(this, 'CleanupLambda');
    cleanupLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['iam:ListAccessKeys', 'iam:DeleteAccessKey'],
        resources: ['*'],
      }),
    );
    cleanupLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:DeleteSecret'],
        resources: [
          'arn:*:secretsmanager:*:*:secret:iam-credential-rotation/*',
        ],
      }),
    );

    const cleanupLambdaTask = new tasks.LambdaInvoke(
      this,
      'CleanupLambdaTask',
      {
        lambdaFunction: cleanupLambda,
        inputPath: '$.Payload',
      },
    );

    const definition = credentialsRotatorLambdaTask.next(
      credentialsHandlerLambdaTask.next(cleanupLambdaTask),
    );

    const stateMachine = new sfn.StateMachine(
      this,
      'IamCredentialsRotatorStateMachine',
      {
        definition,
      },
    );

    const usernamesParameter = new ssm.StringListParameter(
      this,
      'UsernamesStringListParameter',
      {
        stringListValue: props.usernames,
      },
    );

    const eventHandlerFunction = new EventHandlerFunction(
      this,
      'EventHandlerLambda',
      {
        environment: {
          STATE_MACHINE_ARN: stateMachine.stateMachineArn,
          USERNAMES_PARAMETER_NAME: usernamesParameter.parameterName,
        },
      },
    );
    stateMachine.grantStartExecution(eventHandlerFunction);
    usernamesParameter.grantRead(eventHandlerFunction);

    new events.Rule(this, 'ScheduleRule', {
      schedule: events.Schedule.rate(
        props.scheduleDuration || Duration.hours(1),
      ),
      targets: [
        new eventsTargets.LambdaFunction(eventHandlerFunction, {
          retryAttempts: 2,
          maxEventAge: Duration.minutes(2),
        }),
      ],
    });
  }
}
