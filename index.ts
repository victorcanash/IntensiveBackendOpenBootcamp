import server from './src/server';
import { LogError, LogSuccess } from './src/utils/logger';
import { envConfig } from './src/config/env.config';
import { initMongo } from './src/domain/repositories/mongo.repo';

console.log('STARTING SERVER', +envConfig.PORT);
server.listen(+envConfig.PORT, envConfig.HOST, () => {
    LogSuccess(`[SERVER ON]: Running in http://${envConfig.HOST}:${envConfig.PORT}/api`);
});

server.on('error', (error) => {
    LogError(`[SERVER ERROR]: ${error}`);
});

initMongo();
