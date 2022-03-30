import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const { STATE_MACHINE_ARN, USERS_PARAMETER_NAME } = process.env;

const ssmClient = new SSMClient({});
const sfnClient = new SFNClient({});

interface IUser {
  /** Username of an IAM user in the target account */
  u: string;

  /** Optional metadata */
  m?: string;
}

export async function handler() {
  const getParameterResponse = await ssmClient.send(
    new GetParameterCommand({ Name: USERS_PARAMETER_NAME }),
  );
  const data: { users: IUser[] } = JSON.parse(
    getParameterResponse.Parameter?.Value || '',
  );
  console.log(`Got ${data.users.length} users from parameter store`);

  for (const userObj of data.users) {
    const startExecutionResponse = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: STATE_MACHINE_ARN,
        input: JSON.stringify({
          username: userObj.u,
          metadata: userObj.m,
        }),
      }),
    );
    console.log(
      `Started execution for user ${userObj.u} - ${startExecutionResponse.executionArn}`,
    );
  }
}
