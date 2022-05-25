import cors from 'cors';


export const corsOptions: cors.CorsOptions = {
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: [
        'http://localhost:3000'
    ]
};
