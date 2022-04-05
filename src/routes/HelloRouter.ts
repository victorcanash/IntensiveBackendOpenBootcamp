import express, { Request, Response } from 'express';
import { HelloController } from '../controllers/HelloController';
import { LogInfo } from '../utils/logger';


// Router from express
const helloRouter = express.Router();

// http://localhost:8000/api/hello?name=Martin/
helloRouter.route('/')
    // GET:
    .get(async (req: Request, res: Response) => {
        // Obtain a QUery Param
        const name: any = req?.query?.name;
        LogInfo(`Query Param: ${name}`);
        // Controller Instance to execute method
        const controller: HelloController = new HelloController();
        // Obtain Response
        const response = await controller.getMessage(name);
        // Send to the client the response
        return res.send(response);
    });

// Export Hello Router
export default helloRouter;
