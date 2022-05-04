import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import client from '../cache';
import { compareSync } from '../../utils/hashing';
import { jwtSignOptions } from '../../config';
import { userEntity } from '../entities/User.entity';
import { IAuthLogin } from '../interfaces/IAuth.interface';
import { IUser } from '../interfaces/IUser.interface';
import { AuthResponse } from '../types';
import { ModelNotFoundError, ErrorProviders, BadQueryError } from '../../errors';


dotenv.config();
const secret: string = process.env.SECRET_KEY || 'MYSECRETKEY';

export const registerUser = async (user: IUser): Promise<IUser> => {
    const userModel = userEntity();

    let createdUser: IUser = {} as IUser;

    await userModel.findOne({ $or: [{ email: user.email }, { name: user.name }] }).then((userResult: IUser) => {
        if (userResult) {
            if (userResult.name === user.name) {
                throw new BadQueryError(ErrorProviders.AUTH, 'Entered name already exists');
            }
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


export const loginUser = async (auth: IAuthLogin): Promise<AuthResponse> => {
    const userModel = userEntity();

    const response = {
        user: {} as IUser,
        token: ''
    } as AuthResponse;

    await userModel.findOne({ email: auth.email }).then((userResult: IUser) => {
        response.user = userResult;
        if (!response.user) {
            throw new ModelNotFoundError(ErrorProviders.AUTH, 'Invalid email to login');
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    const validPassword = compareSync(auth.password, response.user.password);

    if (!validPassword) {
        const passwordError = new ModelNotFoundError(ErrorProviders.AUTH, 'Invalid password to login');
        passwordError.logError();
        throw passwordError;
    }
    
    const payload = {
        email: response.user.email,
        role: response.user.role
    };
    response.token = jwt.sign(payload, secret, jwtSignOptions);

    return response;
};


export const logoutUser = async (token: string, tokenExp: number): Promise<boolean> => {
    const tokenKey = `bl_${token}`;
    await client.set(tokenKey, token);
    client.expireAt(tokenKey, tokenExp);

    return true;
};
