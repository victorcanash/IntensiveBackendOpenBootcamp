import mongoose from 'mongoose';

import { envConfig, mongooseOptions } from '../../config';
import { LogError, LogSuccess } from '../../utils/logger';


const mongooseUri = `mongodb://${envConfig.DB_HOST}:${envConfig.DB_PORT}/${envConfig.DB_NAME}`;

export const initMongo = () => {
    mongoose.connect(mongooseUri, mongooseOptions).then(
        () => { 
            LogSuccess(`[MONGOOSE ON]: Running in ${mongooseUri}`);
        },
        error => { 
            LogError(`[MONGOOSE ERROR]: ${error}`); 
        });
};

mongoose.connection.on('error', error => {
    LogError(`[MONGOOSE ERROR]: ${error}`);
});

mongoose.connection.on('disconnected', () => {
    LogError('[MONGOOSE ERROR]: Mongoose disconnected');
});

mongoose.connection.on('reconnected', () => {
    LogError('[MONGOOSE ON]: Mongoose reconnected');
});

mongoose.connection.on('reconnectFailed', () => {
    LogError('[MONGOOSE ERROR]: Mongoose failed reconnecting');
});
