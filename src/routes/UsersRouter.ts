import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { verifyToken } from '../middlewares/verifyToken.middleware';
import { UsersController } from '../controllers/UsersController';
import { IUserUpdate } from '../domain/interfaces/IUser.interface';
import { fixNumberValue, fixKataLevelValue } from '../utils/valuesFixer';
import { BadQueryError, ErrorProviders } from '../errors';


const jsonParser = bodyParser.json();

const usersRouter = express.Router();

const controller: UsersController = new UsersController();

usersRouter.route('/')
    .get(verifyToken, async (req: Request, res: Response) => {
        const page: any = req?.query?.page;
        const limit: any = req?.query?.limit;
        const id: any = req?.query?.id;
        const order: any = req?.query?.order;

        const controllerRes = await controller.getUsers(page, limit, order, id);

        return res.status(controllerRes.code).send(controllerRes);
    })

    .delete(verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;

        const controllerRes = await controller.deleteUser(id);

        return res.status(controllerRes.code).send(controllerRes);
    })

    .put(jsonParser, verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;

        const name: string = req?.body?.name;
        const age: number = req?.body?.age;

        if (name && age) {
            const fixedAge = fixNumberValue(age, 1, 100, true);

            const user: IUserUpdate = {
                name: name,
                age: fixedAge,
            };

            const controllerRes = await controller.updateUser(user, id);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.USERS, 'No user can be updated');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

usersRouter.route('/katas')
    .get(verifyToken, async (req: Request, res: Response) => {
        const page: any = req?.query?.page;
        const limit: any = req?.query?.limit;
        const id: any = req?.query?.id;
        const level: any = req?.query?.level;
        const order: any = req?.query?.order;

        const fixedLevel: any = level ? fixKataLevelValue(level) : level;

        const controllerRes = await controller.getKatas(page, limit, order, id, fixedLevel);
        
        return res.status(controllerRes.code).send(controllerRes);
    })

    .delete(verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;

        const controllerRes = await controller.deleteKatas(id);

        return res.status(controllerRes.code).send(controllerRes);
    });

export default usersRouter;
