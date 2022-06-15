import dotenv from 'dotenv';


dotenv.config();
export const envConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 8000,
    DEV_CORS_ORIGIN: process.env.DEV_CORS_ORIGIN || '',
    PROD_CORS_ORIGIN: process.env.PROD_CORS_ORIGIN || '',
    DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/intensive-ob-db',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    SECRET_KEY: process.env.SECRET_KEY || 'MYSECRETKEY',
    AWS_KEY_ID: process.env.AWS_KEY_ID || '',
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || '',
    AWS_REGION: process.env.AWS_REGION || 'eu-west-3',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'bucket_example'
};
