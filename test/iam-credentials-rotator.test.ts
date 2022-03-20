import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IamCredentialsRotator } from '../src';

test('synthesises as we expect', () => {
  const app = new cdk.App();
  const testStack = new cdk.Stack(app, 'TestStack');

  const mockFunction = new lambda.Function(testStack, 'MockFunction', {
    handler: 'index.handler',
    code: lambda.Code.fromAsset(''),
    runtime: lambda.Runtime.NODEJS_14_X,
  });

  const usernames = ['homer', 'marge', 'bart', 'lisa', 'maggie'];

  new IamCredentialsRotator(testStack, 'CredentialsRotator', {
    usernames,
    credentialsHandler: mockFunction,
  });

  const template = Template.fromStack(testStack);

  template.resourceCountIs('AWS::Lambda::Function', 4);
  template.resourceCountIs('AWS::SSM::Parameter', 1);
  template.hasResourceProperties('AWS::SSM::Parameter', {
    Value: usernames.join(','),
  });
});
