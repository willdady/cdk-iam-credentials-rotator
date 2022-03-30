import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const { STATE_MACHINE_ARN, USERNAMES_PARAMETER_NAME } = process.env;

const ssmClient = new SSMClient({});
const sfnClient = new SFNClient({});

interface IUsername {
  /** Username of an IAM user in the target account */
  u: string;

  /** Optional metadata */
  m?: string;
}

export async function handler() {
  const getParameterResponse = await ssmClient.send(
    new GetParameterCommand({ Name: USERNAMES_PARAMETER_NAME }),
  );
  const data: { usernames: IUsername[] } = JSON.parse(
    getParameterResponse.Parameter?.Value || '',
  );
  console.log(`Got ${data.usernames.length} users from parameter store`);

  for (const usernameObj of data.usernames) {
    const startExecutionResponse = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: STATE_MACHINE_ARN,
        input: JSON.stringify({
          username: usernameObj.u,
          metadata: usernameObj.m,
        }),
      }),
    );
    console.log(
      `Started execution for user ${usernameObj.u} - ${startExecutionResponse.executionArn}`,
    );
  }
}
