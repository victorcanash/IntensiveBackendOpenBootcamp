import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

// Security
import cors from 'cors';
import helmet from 'helmet';

// TODO: HTTPS

import rootRouter from '../routes';
import { mongooseConnect } from '../domain/repositories/mongo.repo';


// * Create EXPRESS SERVER
const server: Express = express();


// * Swagger Config and route
server.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        swaggerOptions: {
            url: '/swagger.json',
            explorer: true
        }
    })
);


// * Define SERVER to use "/api" and use rootRouter from 'index.ts' in routes
server.use(
    '/api',
    rootRouter
);


// * Static server
server.use(express.static('public'));


// * Security Config
server.use(helmet());
server.use(cors());


// * Content Type Config
server.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));
server.use(express.json(
    {
        limit: '50mb'
    }
));


// * Redirection Config
server.get('/', (req: Request, res: Response) => {
    res.redirect('/api');
});


// * Start Mongoose
mongooseConnect();


export default server;
