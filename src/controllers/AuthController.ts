import { /* Delete, */ Get, Post, /* Put, Query, */ Route, Tags, Body, Security } from 'tsoa';

import { IAuthController } from './interfaces';
import { BasicResponse, ErrorResponse } from './types';
import server from '../server';
import { LogSuccess /* , LogError, LogWarning */ } from '../utils/logger';
import { registerUser, loginUser /* ,logoutUser */ } from '../domain/orm/Auth.orm';
import { getUserByEmail } from '../domain/orm/Users.orm';
import { IUser } from '../domain/interfaces/IUser.interface';
import { IAuthLogin, IAuthRegister } from '../domain/interfaces/IAuth.interface';


@Route('/api/auth')
@Tags('AuthController')
export class AuthController implements IAuthController {
    
    @Post('/register')
    public async registerUser(@Body()auth: IAuthRegister): Promise<BasicResponse | ErrorResponse | any> {
        let response: BasicResponse | ErrorResponse | any = '';
        const user: IUser = {
            name: auth.name,
            email: auth.email,
            password: auth.password,
            age: auth.age,
            katas: []
        };
        await registerUser(user).then(() => {
            LogSuccess(`[/api/auth/register] Registered user: ${user.name}`);
            
            response = {
                status: 200,
                message: `User registered successfully: ${user.name}`
            };
        }).catch((error) => {
            response = {
                status: 400,
                error: error,
                message: error.message
            };
        });

        return response;
    }

    @Post('/login')
    public async loginUser(@Body()auth: IAuthLogin): Promise<any> {
        let response: any = '';

        await loginUser(auth).then((res: any) => {
            LogSuccess(`[/api/auth/login] Login user: ${auth.email}`);
            response = {
                token: res.token,
                message: `Welcome, ${res.user?.name}`
            };
        }).catch((error: Error) => {
            response = {
                message: error.message
            };
        });
        
        return response;
    }

    /**
     * Endpoint to retreive the User in the Collection "Users" of DB
     * Middleware: Validate JWT
     * In headers you must add the x-access-token with a valid JWT
     * @param {string} id ID of user to retrieve (optional)
     * @returns All user o user found by iD
     */
    @Security('jwt')
    @Get('/me')
    public async getLoggedUser(): Promise<any> {
        let response: any = '';
        const email = server.locals.loggedEmail;
        LogSuccess(`[/api/auth/me] Get logged user by email: ${email}`);
        await getUserByEmail(email).then((user: IUser) => {
            response = user;
        }).catch((error) => {
            response = {
                message: error
            };
        });
        
        return response;
    }
    
    @Security('jwt')
    @Post('/logout')
    public async logoutUser(): Promise<any> {

        // let response: any = '';

        // TODO: Close Session of user
        throw new Error('Method not implemented');
    }
}
