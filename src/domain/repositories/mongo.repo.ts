import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { LogError, LogSuccess } from '../../utils/logger';


dotenv.config();

const dbHost: string = process.env.DB_HOST || 'localhost';
const dbPort: string | number = process.env.DB_PORT || 27017;
const dbName: string = process.env.DB_NAME || 'intensive_ob_db';

const mongooseUri = `mongodb://${dbHost}:${dbPort}/${dbName}`;

const options = {
    autoIndex: true, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

export const initMongo = () => {
    mongoose.connect(mongooseUri, options).then(
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
