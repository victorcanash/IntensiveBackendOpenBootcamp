import express, { Request, Response } from 'express';
import { UsersController } from '../controllers/UsersController';
import { LogInfo } from '../utils/logger';

// Router from express
const usersRouter = express.Router();

// http://localhost:8000/api/users
usersRouter.route('/')
    // GET:
    .get(async (req: Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;
        LogInfo(`Query Param: ${id}`);
        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.getUsers(id);
        // Send to the client the response
        return res.send(response);
    })
    // DELETE:
    .delete(async (req:Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;
        LogInfo(`Query Param: ${id}`);
        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.deleteUser(id);
        // Send to the client the response
        return res.send(response);
    })
    // POST:
    .post(async (req:Request, res: Response) => {

        const name: any = req?.query?.name;
        const age: any = req?.query?.age;
        const email: any = req?.query?.email;

        // Controller Instance to excute method
        const controller: UsersController = new UsersController();

        const user = {
            name: name || 'dafault',
            email: email || 'default email',
            age: age || 18
        };

        // Obtain Response
        const response: any = await controller.createUser(user);
        // Send to the client the response
        return res.send(response);
    })
    // PUT:
    .put(async (req:Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;
        const name: any = req?.query?.name;
        const email: any = req?.query?.email;
        const age: any = req?.query?.age;
        LogInfo(`Query Params: ${id}, ${name}, ${age}, ${email}`);

        // Controller Instance to excute method
        const controller: UsersController = new UsersController();

        const user = {
            name: name,
            email: email,
            age: age
        };

        // Obtain Response
        const response: any = await controller.updateUser(id, user);

        // Send to the client the response
        return res.send(response);
    });

// Export Hello Router
export default usersRouter;
