import dotenv from 'dotenv';
import * as redis from 'redis';

import { LogError, LogSuccess } from '../../utils/logger';


dotenv.config();

const redisHost: string = process.env.REDIS_HOST || 'localhost';
const redisPort: string | number = process.env.REDIS_PORT || 6379;

const redisUrl = `redis://${redisHost}:${redisPort}`;

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
