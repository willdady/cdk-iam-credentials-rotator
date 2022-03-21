const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Will Dady',
  authorAddress: 'willdady@gmail.com',
  cdkVersion: '2.17.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-iam-credentials-rotator',
  description: 'AWS CDK construct for rotating IAM user credentials',
  repositoryUrl: 'https://github.com/willdady/cdk-iam-credentials-rotator.git',
  devDeps: ['@aws-sdk/client-iam', '@aws-sdk/client-secrets-manager', '@aws-sdk/client-sfn', '@aws-sdk/client-ssm'],
  packageName: 'cdk-iam-credentials-rotator',
  keywords: ['iam', 'serverless', 'credentials'],
  majorVersion: 1,
});
project.synth();