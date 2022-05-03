import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


dotenv.config();
export const envConfig = {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 8000,
    DB_HOST: process.env.DB_HORT || 'localhost',
    DB_PORT: process.env.DB_PORT || 27017,
    DB_NAME: process.env.DB_NAME || 'db_example',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    SECRET_KEY: process.env.SECRET_KEY || 'MYSECRETKEY',
};

export const corsOptions: cors.CorsOptions = {
    origin: [
        'http://localhost:3000'
    ]
};

export const mongooseOptions: mongoose.ConnectOptions = {
    autoIndex: true, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

export const jwtSignOptions: jwt.SignOptions = {
    expiresIn: '3h'
};
