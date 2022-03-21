import {
  DeleteAccessKeyCommand,
  IAMClient,
  ListAccessKeysCommand,
} from '@aws-sdk/client-iam';
import {
  DeleteSecretCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

const iamClient = new IAMClient({});
const secretsManagerClient = new SecretsManagerClient({});

interface Payload {
  username: string;
  secretName: string;
}

export async function handler(event: Payload) {
  const { username, secretName } = event;

  // List access keys for user
  console.log(`Getting existing access keys for user ${username}`);
  const listAccessKeysResponse = await iamClient.send(
    new ListAccessKeysCommand({ UserName: username }),
  );
  let accessKeysMetadata = listAccessKeysResponse.AccessKeyMetadata || [];

  if (!accessKeysMetadata.length) {
    throw new Error(
      'Listing access keys for user unexpectedly returned 0 results',
    );
  }

  // Delete all access keys except the newest
  if (accessKeysMetadata.length > 1) {
    accessKeysMetadata = accessKeysMetadata.sort((a, b) => {
      if (a.CreateDate! < b.CreateDate!) return -1;
      if (a.CreateDate! > b.CreateDate!) return 1;
      return 0;
    });
    for (let i = 1; i < accessKeysMetadata.length; i++) {
      const obj = accessKeysMetadata[i];
      await iamClient.send(
        new DeleteAccessKeyCommand({
          AccessKeyId: obj.AccessKeyId,
          UserName: username,
        }),
      );
      console.log(`Deleted access key with id ${obj.AccessKeyId}`);
    }
  }

  // Delete the secret
  await secretsManagerClient.send(
    new DeleteSecretCommand({
      SecretId: secretName,
      ForceDeleteWithoutRecovery: true,
    }),
  );
  console.log(`Deleted secret ${secretName}`);
}
