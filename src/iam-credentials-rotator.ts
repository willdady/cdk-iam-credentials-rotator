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
   * Frequency of key rotation
   * @default 1 hour
   */
  readonly scheduleDuration?: Duration;
  /**
   * The amount of time to wait before deleting old credentials.
   *
   * This value MUST be significantly less-than `scheduleDuration`.
   * @default 5 minutes
   */
  readonly cleanupWaitDuration?: Duration;
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
        description: 'Rotates access credentials for an IAM user',
        environment: {
          SECRET_NAME_PREFIX: id.toLowerCase(),
        },
      },
    );
    credentialsRotatorLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['iam:ListAccessKeys'],
        resources: ['*'],
      }),
    );
    credentialsRotatorLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['iam:CreateAccessKey', 'iam:DeleteAccessKey'],
        resources: props.usernames.map(
          (username) => `arn:*:iam::*:user/${username}`,
        ),
      }),
    );
    credentialsRotatorLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:CreateSecret', 'secretsmanager:DeleteSecret'],
        resources: [
          'arn:*:secretsmanager:*:*:secret:iam-credential-rotation/*',
        ],
      }),
    );

    const credentialsRotatorLambdaTask = new tasks.LambdaInvoke(
      this,
      'RotateCredentials',
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
      'HandleCredentials',
      {
        lambdaFunction: props.credentialsHandler,
        resultPath: sfn.JsonPath.DISCARD,
        inputPath: '$.Payload',
      },
    );

    // Step 3
    const cleanupLambda = new CleanupFunction(this, 'CleanupLambda', {
      description: 'Deletes old IAM credentials for a specific user',
    });
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

    const cleanupLambdaTask = new tasks.LambdaInvoke(this, 'CleanUp', {
      lambdaFunction: cleanupLambda,
      inputPath: '$.Payload',
    });

    const waitBeforeCleanup = new sfn.Wait(this, 'Wait', {
      time: sfn.WaitTime.duration(
        props.cleanupWaitDuration || Duration.minutes(5),
      ),
    });

    const definition = credentialsRotatorLambdaTask.next(
      credentialsHandlerLambdaTask.next(
        waitBeforeCleanup.next(cleanupLambdaTask),
      ),
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
        description: 'Initiates IAM credential rotation for a list of users',
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
