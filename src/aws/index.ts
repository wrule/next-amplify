import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const str1 = "{\"API\":{\"GraphQL\":{\"endpoint\":\"https://kj4au2owkrakxkfsfx2lvpn3ny.appsync-api.ap-northeast-1.amazonaws.com/graphql\",\"region\":\"ap-northeast-1\",\"defaultAuthMode\":\"apiKey\",\"apiKey\":\"da2-ccctlxdlbzgurdu3brtr722xly\"}}}";
const str2 = (process.env.app_aws_exports as string)?.slice();

console.log(1234,  Buffer.from(str1).toString('hex') === Buffer.from(str2).toString('hex'));

const config = (process.env.NODE_ENV !== 'production' ?
  require('../../aws_config/aws-exports').default :
  JSON.parse("{\"API\":{\"GraphQL\":{\"endpoint\":\"https://kj4au2owkrakxkfsfx2lvpn3ny.appsync-api.ap-northeast-1.amazonaws.com/graphql\",\"region\":\"ap-northeast-1\",\"defaultAuthMode\":\"apiKey\",\"apiKey\":\"da2-ccctlxdlbzgurdu3brtr722xly\"}}}")
) as ResourcesConfig;

Amplify.configure(config);
const client = generateClient();

export const GQLClient = client;
