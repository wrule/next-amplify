import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

const config = (process.env.NODE_ENV !== 'production' ?
  require('../../aws_config/aws-exports').default :
  JSON.parse(process.env.app_aws_exports as string)
) as ResourcesConfig;
console.log(1234, config);

Amplify.configure(config);

const client = generateClient();

export const GQLClient = client;
