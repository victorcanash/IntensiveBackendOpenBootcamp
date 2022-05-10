import * as redis from 'redis';

import { envConfig } from '../../config/env.config';
import { LogError, LogSuccess } from '../../utils/logger';


const redisUrl = `${envConfig.REDIS_URI}`;

const client = redis.createClient({ 
    url: redisUrl 
});

client.on('error', (error) => {
    LogError(`[REDIS CLIENT ERROR]: ${error}`);
});

client.on('connect', () => {
    LogSuccess(`[REDIS CLIENT ON]: Running in ${redisUrl}`);
});

(async () => {
    await client.connect();
})();

export default client;
