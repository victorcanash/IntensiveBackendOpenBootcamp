import dotenv from 'dotenv';
import cors from 'cors';
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

export const jwtSignOptions: jwt.SignOptions = {
    expiresIn: '3h'
};
