# IAM Credentials Rotator

AWS CDK construct for rotating IAM user credentials.

## How it works

TODO

## Usage

```typescript
const credentialsHandler = new lambda.Function(this, 'MyCredentialsHandler', {
  handler: 'index.handler',
  code: lambda.Code.fromAsset('path/to/your/code'),
  runtime: lambda.Runtime.NODEJS_14_X,
});

new IamCredentialsRotator(this, 'MyCredentialsRotator', {
  usernames: ['homer', 'marge', 'bart', 'lisa', 'maggie'],
  credentialsHandler,
});
```

You must provide a Lambda function which is called immediately after a new access key is created for a user. The newly created credentials must be retrieved from AWS Secrets Manager using the secret name passed in to the function. 

Once you have the retrieved the credentials you are free to do with them as you with e.g. send them to a trusted 3rd party. Once your function exits the secret will be deleted from AWS Secrets Manager.

Below is a minimal boilerplate for your handler function.

```typescript
// TODO
```