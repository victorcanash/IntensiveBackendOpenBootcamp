import express, { Request, Response } from 'express';
// BCRYPT for passwords
import bcrypt from 'bcrypt';
// Body Parser (Read JSON from Body in Requests)
import bodyParser from 'body-parser';

import { verifyToken } from '../middlewares/verifyToken.middleware';
import { AuthController } from '../controllers/AuthController';
import { IUser } from '../domain/interfaces/IUser.interface';
import { IAuth } from '../domain/interfaces/IAuth.interface';


// Middleware to read JSON in Body
const jsonParser = bodyParser.json();

// Router from express
const authRouter = express.Router();

authRouter.route('/register')
    .post(jsonParser, async (req:Request, res: Response) => {
        const { name, email, password, age } = req?.body;
        let hashedPassword: string = '';

        if (name && password && email && age) {
            // Obtain the password in request and cypher
            hashedPassword = bcrypt.hashSync(password, 8);

            const newUser: IUser = {
                name: name,
                email: email,
                password: hashedPassword,
                age: age,
                katas: []
            };

            // Controller Instance to excute method
            const controller: AuthController = new AuthController();

            // Obtain Response
            const response: any = await controller.registerUser(newUser);

            // Send to the client the response
            return res.status(200).send(response);
        } else {
            // Send to the client the response
            return res.status(400).send({
                message: '[ERROR User Data missing]: No user can be registered'
            });
        }
    });

authRouter.route('/login')
    .post(jsonParser, async (req:Request, res: Response) => {
        const { email, password } = req?.body;

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
        } else {
            // Send to the client the response
            return res.status(400).send({
                message: '[ERROR User Data missing]: No user can be registered'
            });

        }
    });

// Route to get logged user
authRouter.route('/me')
    .get(verifyToken, async (req: Request, res: Response) => {
        // Get logged user id from verifyToken middleware
        const id: any = res.locals.loggedUser?._id;

        if (id) {
            // Controller: Auth Controller
            const controller: AuthController = new AuthController();

            // Obtain response from Controller
            const response: any = await controller.getLoggedUser(id);

            // If user is authorised:
            return res.status(200).send(response);
        } else {
            return res.status(401).send({
                message: 'You are not authorised to perform this action'
            });
        }
    });


export default authRouter;
