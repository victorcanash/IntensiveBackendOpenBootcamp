// Environment variables
import dotenv from 'dotenv';
// BCRYPT for passwords
import bcrypt from 'bcrypt';
// JWT
import jwt from 'jsonwebtoken';

import { /* LogSuccess, */ LogError } from '../../utils/logger';
import { userEntity } from '../entities/User.entity';
import { IAuthLogin } from '../interfaces/IAuth.interface';
import { IUser } from '../interfaces/IUser.interface';


// Configuration of environment variables
dotenv.config();

// Obtain Secret key to generate JWT
const secret = process.env.SECRETKEY || 'MYSECRETKEY';

/**
 * Method to register/create a User from Collection "Users" passing its IUser in Mongo Server
 */
 export const registerUser = async (user: IUser): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        await userModel.create(user).then((user: IUser) => {
            if (user) {
                return user;
            } else {
                throw new Error('[ERROR Registering in ORM]: Something was wrong');
            }
        }).catch((error: Error) => {
            LogError(error.message);
            throw new Error(error.message);
        });

    } catch (error: any) {
        throw new Error(error?.message);
    }
};

/**
 * Method to login a User from Collection "Users" passing its IAuth in Mongo Server
 */
export const loginUser = async (auth: IAuthLogin): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        let userFound: IUser | undefined = undefined;
        let token: string | undefined = undefined;

        await userModel.findOne({ email: auth.email }).then((user: IUser) => {
            userFound = user;
            if (!userFound) {
                throw new Error('[ERROR Logging in ORM]: Email not valid');
            }
        }).catch((error: Error) => {
            LogError(error.message);
            throw new Error(error.message);
        });

        const validPassword = bcrypt.compareSync(auth.password, userFound!.password);

        if (!validPassword) {
            LogError('[ERROR Logging in ORM]: Password not valid');
            throw new Error('[ERROR Logging in ORM]: Password not valid');
        }
        
        token = jwt.sign({ email: userFound!.email }, secret, {
            expiresIn: '24h'
        });

        return {
            user: userFound,
            token: token
        };

    } catch (error: any) {
        throw new Error(error?.message);
    }
};

/**
 * Method to logout the current connected user in Mongod Server
 */
export const logoutUser = async (): Promise<any | undefined> => {
    // TODO: NOT IMPLEMENTED
};
