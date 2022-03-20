import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const { STATE_MACHINE_ARN, USERNAMES_PARAMETER_NAME } = process.env;

const ssmClient = new SSMClient({});
const sfnClient = new SFNClient({});

export async function handler() {
  const getParameterResponse = await ssmClient.send(
    new GetParameterCommand({ Name: USERNAMES_PARAMETER_NAME }),
  );
  const usernames = (getParameterResponse.Parameter?.Value || '').split(',');
  console.log(`Got ${usernames.length} from parameter store`);

  for (const username of usernames) {
    const startExecutionResponse = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: STATE_MACHINE_ARN,
        input: JSON.stringify({ username }),
      }),
    );
    console.log(
      `Started execution for user ${username} - ${startExecutionResponse.executionArn}`,
    );
  }
}
