import { Amplify, ResourcesConfig } from 'aws-amplify';
import config from '../../aws_config/aws-exports';
import { generateClient } from 'aws-amplify/api';

Amplify.configure(config as ResourcesConfig);

const client = generateClient();

export const GQLClient = client;
