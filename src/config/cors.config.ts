import cors from 'cors';

import { envConfig } from './env.config';


export const corsOptions: cors.CorsOptions = {
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: [
        `${envConfig.DEV_CORS_ORIGIN}`,
        `${envConfig.PROD_CORS_ORIGIN}`,
    ]
};
