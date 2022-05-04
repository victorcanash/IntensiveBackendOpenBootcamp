import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { LogInfo } from '../utils/logger';
import helloRouter from './HelloRouter';
import goodbyeRouter from './GoodbyeRouter';
import usersRouter from './UsersRouter';
import authRouter from './AuthRouter';
import katasRouter from './KatasRouter';


const server = express();

const rootRouter = express.Router();

rootRouter.get('/', (req: Request, res: Response) => {
    LogInfo('[/api] Root route');
    res.status(StatusCodes.OK).send({
        message: 'Welcome to my API Restful: Express + TS + Nodemon + Jest + Swagger + Mongoose + Redis',
        name: server.get('pkg').name,
        version: server.get('pkg').version,
        description: server.get('pkg').description,
        author: server.get('pkg').author,
      });
});

server.use('/', rootRouter);
server.use('/hello', helloRouter);
server.use('/goodbye', goodbyeRouter);
server.use('/users', usersRouter);
server.use('/auth', authRouter);
server.use('/katas', katasRouter);

export default server;
