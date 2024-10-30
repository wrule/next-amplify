import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const jsonText1 = "{\"API\":{\"GraphQL\":{\"endpoint\":\"https://kj4au2owkrakxkfsfx2lvpn3ny.appsync-api.ap-northeast-1.amazonaws.com/graphql\",\"region\":\"ap-northeast-1\",\"defaultAuthMode\":\"apiKey\",\"apiKey\":\"da2-ccctlxdlbzgurdu3brtr722xly\"}}}";
// const jsonText2 = "";

const config = JSON.parse(jsonText1) as ResourcesConfig;

Amplify.configure(config);
const client = generateClient();

export const GQLClient = client;
