import { /* Delete, */ Get, Post, /* Put, */ Query, Route, Tags, Body } from 'tsoa';

import { LogSuccess /* , LogError, LogWarning */ } from '../utils/logger';
import { IAuthController } from './interfaces';
import { registerUser, loginUser /* ,logoutUser */ } from '../domain/orm/Auth.orm';
import { getUserByID } from '../domain/orm/Users.orm';
import { IUser } from '../domain/interfaces/IUser.interface';
import { IAuthLogin, IAuthRegister } from '../domain/interfaces/IAuth.interface';
// import { AuthResponse, ErrorResponse } from './types';


@Route('/api/auth')
@Tags('AuthController')
export class AuthController implements IAuthController {
    
    @Post('/register')
    public async registerUser(@Body()auth: IAuthRegister): Promise<any> {
        let response: any = '';

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
                message: `User registered successfully: ${user.name}`
            };
        });

        return response;
    }

    @Post('/login')
    public async loginUser(@Body()auth: IAuthLogin): Promise<any> {
        let response: any = '';

        LogSuccess(`[/api/auth/login] Login user: ${auth.email}`);
        const data = await loginUser(auth);
        response = {
            token: data.token,
            message: `Welcome, ${data.user.name}`
        };

        return response;
    }

    /**
     * Endpoint to retreive the User in the Collection "Users" of DB
     * Middleware: Validate JWT
     * In headers you must add the x-access-token with a valid JWT
     * @param {string} id ID of user to retrieve (optional)
     * @returns All user o user found by iD
     */
    @Get('/me')
    public async getLoggedUser(@Query()id: string): Promise<any> {
        let response: any = '';
             
        LogSuccess(`[/api/auth/me] Get logged user by ID: ${id}`);
        response = await getUserByID(id);
        
        return response;
    }
    
    @Post('/logout')
    public async logoutUser(): Promise<any> {

        // let response: any = '';

        // TODO: Close Session of user
        throw new Error('Method not implemented');
    }
}
