import server from './src/server';
import { LogError, LogSuccess } from './src/utils/logger';
import { envConfig } from './src/config/env.config';
import { initMongo } from './src/domain/repositories/mongo.repo';


server.listen(+envConfig.PORT, () => {
    LogSuccess('[SERVER ON]: Running');
});

server.on('error', (error) => {
    LogError(`[SERVER ERROR]: ${error}`);
});

initMongo();
