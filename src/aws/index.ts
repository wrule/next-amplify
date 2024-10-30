import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const jsonText1 = "{\"API\":{\"GraphQL\":{\"endpoint\":\"https://kj4au2owkrakxkfsfx2lvpn3ny.appsync-api.ap-northeast-1.amazonaws.com/graphql\",\"region\":\"ap-northeast-1\",\"defaultAuthMode\":\"apiKey\",\"apiKey\":\"da2-ccctlxdlbzgurdu3brtr722xly\"}}}";
const jsonText2 = process.env.NEXT_APP_CONFIG as string;

console.log(1234, jsonText1 === jsonText2);

const env = { ...process.env };
const config = JSON.parse(jsonText2 === undefined ? jsonText1 : jsonText2) as ResourcesConfig;

Amplify.configure(config);
const client = generateClient();

export const GQLClient = client;
export const envInfo = env;
