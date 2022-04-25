// Environment variables
import dotenv from 'dotenv';
// BCRYPT for passwords
import bcrypt from 'bcrypt';
// JWT
import jwt from 'jsonwebtoken';

import { userEntity } from '../entities/User.entity';
import { IAuthLogin } from '../interfaces/IAuth.interface';
import { IUser } from '../interfaces/IUser.interface';
import { ModelNotFoundError, ErrorProviders, BadQueryError } from '../../errors';


// Configuration of environment variables
dotenv.config();

// Obtain Secret key to generate JWT
const secret = process.env.SECRETKEY || 'MYSECRETKEY';

/**
 * Method to register/create a User from Collection "Users" passing its IUser in Mongo Server
 */
 export const registerUser = async (user: IUser): Promise<IUser | undefined> => {
    const userModel = userEntity();

    let createdUser: IUser | undefined = undefined; 

    await userModel.findOne({ email: user.email }).then((userResult: IUser) => {
        if (userResult) {
            throw new BadQueryError(ErrorProviders.AUTH, 'Entered email already exists');
        }
    }).catch((error: BadQueryError) => {
        error.logError();
        throw error;
    });
    
    await userModel.create(user).then((userResult: IUser) => {
        createdUser = userResult;
        if (!createdUser) {
            throw new ModelNotFoundError(ErrorProviders.AUTH, 'No user can be registered');
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return createdUser;
};

/**
 * Method to login a User from Collection "Users" passing its IAuth in Mongo Server
 */
export const loginUser = async (auth: IAuthLogin): Promise<{user: IUser | undefined, token: string | undefined}> => {
    const userModel = userEntity();

    let userFound: IUser | undefined = undefined;
    let token: string | undefined = undefined;

    await userModel.findOne({ email: auth.email }).then((userResult: IUser) => {
        userFound = userResult;
        if (!userFound) {
            throw new ModelNotFoundError(ErrorProviders.AUTH, 'Invalid email to login');
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    const validPassword = bcrypt.compareSync(auth.password, userFound!.password);

    if (!validPassword) {
        const passwordError = new ModelNotFoundError(ErrorProviders.AUTH, 'Invalid password to login');
        passwordError.logError();
        throw passwordError;
    }
    
    token = jwt.sign({ email: userFound!.email }, secret, {
        expiresIn: '24h'
    });

    const result = {
        user: userFound,
        token: token
    };
    return result;
};

/**
 * Method to logout the current connected user in Mongod Server
 */
export const logoutUser = async (): Promise<any | undefined> => {
    // TODO: NOT IMPLEMENTED
};
