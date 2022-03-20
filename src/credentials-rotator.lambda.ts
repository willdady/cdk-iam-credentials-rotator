import {
  CreateAccessKeyCommand,
  DeleteAccessKeyCommand,
  IAMClient,
  ListAccessKeysCommand,
} from '@aws-sdk/client-iam';
import {
  CreateSecretCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

const iamClient = new IAMClient({});
const secretsManagerClient = new SecretsManagerClient({});

interface Payload {
  username: string;
}

export async function handler(event: Payload) {
  const { username } = event;

  console.log(`Getting existing access keys for user ${username}`);
  const listAccessKeysResponse = await iamClient.send(
    new ListAccessKeysCommand({ UserName: username }),
  );

  let accessKeysMetadata = listAccessKeysResponse.AccessKeyMetadata || [];
  // Delete inactive access keys
  if (accessKeysMetadata.length > 1) {
    for (const obj of accessKeysMetadata) {
      if (obj.Status === 'Inactive') {
        await iamClient.send(
          new DeleteAccessKeyCommand({ AccessKeyId: obj.AccessKeyId }),
        );
        console.log(`Deleted inactive key with id ${obj.AccessKeyId}`);
      }
    }
  }
  // Remove inactive access keys from array
  accessKeysMetadata = accessKeysMetadata.filter(
    (x) => x.Status !== 'Inactive',
  );
  // Fail if we have 2 active access keys
  if (accessKeysMetadata.length === 2) {
    throw new Error('Can not rotate credentials as user has 2 active keys');
  }

  // Create new credentials
  const createAccessKeyResponse = await iamClient.send(
    new CreateAccessKeyCommand({ UserName: username }),
  );

  // Store credentials in AWS Secrets Manager
  const secretName = `iam-credential-rotation/${username}-iam-credentials`;
  await secretsManagerClient.send(
    new CreateSecretCommand({
      Name: secretName,
      SecretString: JSON.stringify(createAccessKeyResponse.AccessKey),
    }),
  );
  console.log(
    `New credentials created and stored in AWS Secrets Manager with name '${secretName}'`,
  );

  return { username, secretName };
}
