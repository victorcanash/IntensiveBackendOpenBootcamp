import dotenv from 'dotenv';


dotenv.config();
export const envConfig = {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 8000,
    DB_HOST: process.env.DB_HORT || 'localhost',
    DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/intensive-ob-db',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    SECRET_KEY: process.env.SECRET_KEY || 'MYSECRETKEY',
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'bucket_example'
};
