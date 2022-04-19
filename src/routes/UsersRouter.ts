import express, { Request, Response } from 'express';
// Body Parser (Read JSON from Body in Requests)
import bodyParser from 'body-parser';

import { UsersController } from '../controllers/UsersController';
// import { LogInfo } from '../utils/logger';
// JWT Verifier MiddleWare
import { verifyToken } from '../middlewares/verifyToken.middleware';


// Middleware to read JSON in Body
const jsonParser = bodyParser.json();

// Router from express
const usersRouter = express.Router();

// http://localhost:8000/api/users
usersRouter.route('/')
    // GET:
    .get(verifyToken, async (req: Request, res: Response) => {
        // Obtain Query Params (ID)
        const id: any = req?.query?.id;
        const page: any = req?.query?.page || 1;
        const limit: any = req?.query?.limit || 10;

        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.getUsers(page, limit, id);
        // Send to the client the response
        return res.status(200).send(response);
    })
    // DELETE:
    .delete(verifyToken, async (req: Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;
        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.deleteUser(id);
        // Send to the client the response
        return res.status(200).send(response);
    })
    // PUT:
    .put(jsonParser, verifyToken, async (req: Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;

        // Read from body
        const name: any = req?.body?.name;
        const email: any = req?.body?.email;
        const age: any = req?.body?.age;

        if (name && email && age) {
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
            return res.status(200).send(response);
        } else {
            return res.status(400).send({
                message: '[ERROR] Updating User. You need to send all attributes of User to update it'
            });
        }
    });

// http://localhost:8000/api/users/katas
usersRouter.route('/katas')
    .get(verifyToken, async (req: Request, res: Response) => {
        // Obtain Query Params (ID)
        const id: any = req?.query?.id;
        const page: any = req?.query?.page || 1;
        const limit: any = req?.query?.limit || 10;

        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.getKatas(page, limit, id);
        // Send to the client the response
        return res.status(200).send(response);
});

// Export Hello Router
export default usersRouter;

/**
 * 
 * Get Documents => 200 OK
 * Creation Documents => 201 OK
 * Deletion of Documents => 200 (Entity) / 204 (No return)
 * Update of Documents =>  200 (Entity) / 204 (No return)
 * 
 */
