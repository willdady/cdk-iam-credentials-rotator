const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Will Dady',
  authorAddress: 'willdady@gmail.com',
  cdkVersion: '2.17.0',
  defaultReleaseBranch: 'main',
  name: 'iam-credentials-rotator',
  repositoryUrl: 'https://github.com/willdady/iam-credentials-rotator.git',

  // cdkDependencies: undefined,      /* Which AWS CDK modules (those that start with "@aws-cdk/") does this library require when consumed? */
  // cdkTestDependencies: undefined,  /* AWS CDK modules required for testing. */
  // deps: ['@aws-sdk/client-iam', '@aws-sdk/client-secrets-manager'],
  // description: undefined,          /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: ['@aws-sdk/client-iam', '@aws-sdk/client-secrets-manager', '@aws-sdk/client-sfn', '@aws-sdk/client-ssm'],
  packageName: 'cdk-iam-credentials-rotator',
  // release: undefined,              /* Add release management to this project. */
});
project.synth();