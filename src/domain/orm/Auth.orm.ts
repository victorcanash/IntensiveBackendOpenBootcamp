// Environment variables
import dotenv from 'dotenv';
// BCRYPT for passwords
import bcrypt from 'bcrypt';
// JWT
import jwt from 'jsonwebtoken';

import { /* LogSuccess, */ LogError } from '../../utils/logger';
import { userEntity } from '../entities/User.entity';
import { IAuth } from '../interfaces/IAuth.interface';
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

        // Create / Insert new User
        return await userModel.create(user);

    } catch (error) {
        LogError(`[ORM ERROR]: Creating User: ${error}`);
    }
};

/**
 * Method to login a User from Collection "Users" passing its IAuth in Mongo Server
 */
export const loginUser = async (auth: IAuth): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        let userFound: IUser | undefined = undefined;
        let token: string | undefined = undefined;

        // Check if user exists by unique email
        await userModel.findOne({ email: auth.email }).then((user: IUser) => {
            userFound = user;
        }).catch((error) => {
            console.error('[ERROR Authentication in ORM]: User Not Found');
            throw new Error(`[ERROR Authentication in ORM]: User Not Found: ${error}`);
        });

        // Check if password is valid (compare with bcrypt)
        const validPassword = bcrypt.compareSync(auth.password, userFound!.password);

        if (!validPassword) {
            console.error('[ERROR Authentication in ORM]: Password not valid');
            throw new Error('[ERROR Authentication in ORM]: Password not valid');
        }
        
        // Generate our JWT
        token = jwt.sign({ email: userFound!.email }, secret, {
            expiresIn: '2h'
        });

        return {
            user: userFound,
            token: token
        };

    } catch (error) {
        LogError(`[ORM ERROR]: Logging User: ${error}`);
    }
};

/**
 * Method to logout the current connected user in Mongod Server
 */
export const logoutUser = async (): Promise<any | undefined> => {
    // TODO: NOT IMPLEMENTED
};
