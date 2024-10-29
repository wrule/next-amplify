import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const config = (false ?
  require('../../aws_config/aws-exports').default :
  JSON.parse(
    ("{\"API\":{\"GraphQL\":{\"endpoint\":\"https://kj4au2owkrakxkfsfx2lvpn3ny.appsync-api.ap-northeast-1.amazonaws.com/graphql\",\"region\":\"ap-northeast-1\",\"defaultAuthMode\":\"apiKey\",\"apiKey\":\"da2-ccctlxdlbzgurdu3brtr722xly\"}}}" as string)
  )
) as ResourcesConfig;
console.log(1234, config);

Amplify.configure(config);

const client = generateClient();

export const GQLClient = client;
