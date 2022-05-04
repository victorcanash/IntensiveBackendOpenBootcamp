import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import helmet from 'helmet';

// TODO: HTTPS

import pkg from '../../package.json';
import { envConfig } from '../config/env.config';
import { corsOptions } from '../config/cors.config';
import rootRouter from '../routes';


// * Create express server
const server: Express = express();

// * Server settings
server.set('port', envConfig.PORT);
server.set('pkg', pkg);
server.set('json spaces', 4);

// * Security Config
server.use(helmet());
server.use(cors(corsOptions));

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

// * Redirection Config
server.get('/', (req: Request, res: Response) => {
    res.redirect('/api');
});


export default server;
