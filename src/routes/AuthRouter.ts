import express, { Request, Response } from 'express';
// BCRYPT for passwords
import bcrypt from 'bcrypt';

import { AuthController } from '../controllers/AuthController';
import { IUser } from '../domain/interfaces/IUser.interface';
import { IAuth } from '../domain/interfaces/IAuth.interface';


// Router from express
const authRouter = express.Router();

authRouter.route('/auth/register')
    .post(async (req:Request, res: Response) => {
        const { name, email, password, age } = req.body;
        let hashedPassword = '';

        if (name && password && email && age) {
            // Obtain the password in request and cypher
            hashedPassword = bcrypt.hashSync(password, 8);

            const newUser: IUser = {
                name: name,
                email: email,
                password: hashedPassword,
                age: age
            };

            // Controller Instance to excute method
            const controller: AuthController = new AuthController();

            // Obtain Response
            const response: any = await controller.registerUser(newUser);

            // Send to the client the response
            return res.status(200).send(response);
        }
});



authRouter.route('/auth/login')
    .post(async (req:Request, res: Response) => {
        const { email, password } = req.body;

        if (email && password) {
            // Controller Instance to excute method
            const controller: AuthController = new AuthController();

            const auth: IAuth = {
                email: email,
                password: password
            };

            // Obtain Response
            const response: any = await controller.loginUser(auth);

            // Send to the client the response which includes the JWT to authorize requests
            return res.status(200).send(response);
        }
});

export default authRouter;
