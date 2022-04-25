import express, { Request, Response } from 'express';

import { GoodbyeController } from '../controllers/GoodbyeController';


const goodbyeRouter = express.Router();

// http://localhost:8000/api/goodbye?name=Martin/
goodbyeRouter.route('/')
    // GET:
    .get(async (req: Request, res: Response) => {
        // Obtain a QUery Param
        const name: any = req?.query?.name;
        // Controller Instance to execute method
        const controller: GoodbyeController = new GoodbyeController();
        // Obtain Response
        const response = await controller.getDateMessage(name);
        // Send to the client the response
        return res.status(response.code).send(response);
    });

// Export Hello Router
export default goodbyeRouter;
