import { Amplify, ResourcesConfig } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

Amplify.configure((process.env.NODE_ENV !== 'production' ?
  require('../../aws_config/aws-exports').default :
  JSON.parse(process.env.app_aws_exports as string)
) as ResourcesConfig);

const client = generateClient();

export const GQLClient = client;
