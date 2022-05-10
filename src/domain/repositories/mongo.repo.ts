import mongoose from 'mongoose';

import { envConfig } from '../../config/env.config';
import { mongooseOptions } from '../../config/mongo.config';
import { LogError, LogSuccess } from '../../utils/logger';


const mongooseUri = `${envConfig.DB_URI}`;

export const initMongo = () => {
    mongoose.connect(mongooseUri, mongooseOptions).then(
        () => { 
            LogSuccess('[MONGOOSE ON]: Running');
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
