import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';

import { verifyToken } from '../middlewares/verifyToken.middleware';
import { AuthController } from '../controllers/AuthController';
import { IAuthLogin, IAuthRegister } from '../domain/interfaces/IAuth.interface';
import { fixNumberValue } from '../utils/valuesFixer';
import { BadQueryError, ErrorProviders } from '../errors';


const jsonParser = bodyParser.json();

const authRouter = express.Router();

const controller: AuthController = new AuthController();

authRouter.route('/register')
    .post(jsonParser, async (req:Request, res: Response) => {
        const name: string = req?.body?.name;
        const email: string = req?.body?.email;
        const password: string = req?.body?.password;
        const age: number = req?.body?.age;

        if (name && password && email && age) {
            const fixedAge = fixNumberValue(age, 1, 100, true);

            const hashedPassword = bcrypt.hashSync(password, 8);

            const auth: IAuthRegister = {
                name: name,
                email: email,
                password: hashedPassword,
                age: fixedAge
            };

            const controllerRes = await controller.registerUser(auth);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.AUTH, 'No user can be registered');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

authRouter.route('/login')
    .post(jsonParser, async (req:Request, res: Response) => {
        const email: string = req?.body?.email;
        const password: string = req?.body?.password;

        if (email && password) {
            const auth: IAuthLogin = {
                email: email,
                password: password
            };

            const controllerRes = await controller.loginUser(auth);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.AUTH, 'No user can be logged');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

authRouter.route('/me')
    .get(verifyToken, async (req: Request, res: Response) => {
        const controllerRes = await controller.getLoggedUser();

        return res.status(controllerRes.code).send(controllerRes);
    });


export default authRouter;
