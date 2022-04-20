import express, { Request, Response } from 'express';
// Body Parser (Read JSON from Body in Requests)
import bodyParser from 'body-parser';

// import { LogInfo } from '../utils/logger';
import { verifyToken } from '../middlewares/verifyToken.middleware';
import { UsersController } from '../controllers/UsersController';
import { IUserUpdate } from '../domain/interfaces/IUser.interface';
import { KataLevel } from '../domain/interfaces/IKata.interface';


// Middleware to read JSON in Body
const jsonParser = bodyParser.json();

// Router from express
const usersRouter = express.Router();

// http://localhost:8000/api/users
usersRouter.route('/')
    // GET:
    .get(verifyToken, async (req: Request, res: Response) => {
        // Obtain Query Params
        const page: any = req?.query?.page || 1;
        const limit: any = req?.query?.limit || 10;
        const id: any = req?.query?.id;
        const orderQuery: any = req?.query?.order || '{}';
        const order: {} = JSON.parse(orderQuery);

        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.getUsers(page, limit, order, id);
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
        const age: any = req?.body?.age;

        if (name && age) {
            // Controller Instance to excute method
            const controller: UsersController = new UsersController();

            const user: IUserUpdate = {
                name: name,
                age: age,
            };

            // Obtain Response
            const response: any = await controller.updateUser(user, id);

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
        // Obtain Query Params
        const page: any = req?.query?.page || 1;
        const limit: any = req?.query?.limit || 10;
        const id: any = req?.query?.id;
        let level: any = req?.query?.level;
        if (level) {
            if (level.toUpperCase().includes('BASIC')) {
                level = KataLevel.BASIC;
            } else if (level.toUpperCase().includes('MEDIUM')) {
                level = KataLevel.MEDIUM;
            } else if (level.toUpperCase().includes('HIGH')) {
                level = KataLevel.HIGH;
            }
        }
        const orderQuery: any = req?.query?.order || '{}';
        const order: {} = JSON.parse(orderQuery);

        // Controller Instance to excute method
        const controller: UsersController = new UsersController();
        // Obtain Reponse
        const response: any = await controller.getKatas(page, limit, order, id, level);
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
