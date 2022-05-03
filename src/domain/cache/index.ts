import * as redis from 'redis';

import { envConfig } from '../../config';
import { LogError, LogSuccess } from '../../utils/logger';


const redisUrl = `redis://${envConfig.REDIS_HOST}:${envConfig.REDIS_PORT}`;

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
