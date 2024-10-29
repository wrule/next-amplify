import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const config = (false ?
  require('../../aws_config/aws-exports').default :
  JSON.parse(
    process.env.app_aws_exports as string
    // ("{\"API\":{\"GraphQL\":{\"endpoint\":\"https://kj4au2owkrakxkfsfx2lvpn3ny.appsync-api.ap-northeast-1.amazonaws.com/graphql\",\"region\":\"ap-northeast-1\",\"defaultAuthMode\":\"apiKey\",\"apiKey\":\"da2-ccctlxdlbzgurdu3brtr722xly\"}}}" as string)
  )
) as ResourcesConfig;
console.log(1234, config);
console.log(5678, process.env.app_aws_exports, JSON.stringify(process.env.app_aws_exports), typeof process.env.app_aws_exports);
console.log(4321, JSON.parse(process.env.app_aws_exports as string));
Amplify.configure(config);

const client = generateClient();

export const GQLClient = client;
