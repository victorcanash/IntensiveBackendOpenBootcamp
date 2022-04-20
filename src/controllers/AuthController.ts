import { /* Delete, */ Get, Post, /* Put, */ Query, Route, Tags, Body } from 'tsoa';

import { LogSuccess, /* LogError, */ LogWarning } from '../utils/logger';
import { IAuthController } from './interfaces';
import { registerUser, loginUser /* ,logoutUser */ } from '../domain/orm/Auth.orm';
import { getUserByID } from '../domain/orm/Users.orm';
import { IUser } from '../domain/interfaces/IUser.interface';
import { IAuth } from '../domain/interfaces/IAuth.interface';
import { AuthResponse, ErrorResponse } from './types';


@Route('/api/auth')
@Tags('AuthController')
export class AuthController implements IAuthController {
    
    @Post('/register')
    public async registerUser(@Body()user: IUser): Promise<any> {
        let response: any = '';

        if (user) {
            LogSuccess(`[/api/auth/register] Register New User: ${user.email}`);
            await registerUser(user).then(() => {
                LogSuccess(`[/api/auth/register] Created User: ${user.email}`);
                response = {
                    message: `User created successfully: ${user.name}`
                };
            });
        } else {
            LogWarning('[/api/auth/register] Register needs User Entity');
            response = {
                message: 'User not Registered: Please, provide a User Entity to create one'
            };
        }

        return response;
    }

    @Post('/login')
    public async loginUser(@Body()auth: IAuth): Promise<any> {
        let response: AuthResponse | ErrorResponse | undefined;

        if (auth) {
            LogSuccess(`[/api/auth/login] Login User: ${auth.email}`);
            const data = await loginUser(auth);
            response = {
                token: data.token,
                message: `Welcome, ${data.user.name}`
            };
        } else {
            LogWarning('[/api/auth/login] Login needs Auth Entity (email && password');
            response = {
                error: '[AUTH ERROR]: Email & Password are needed',
                message: 'Please, provide an email && password to login'
            };
        }

        return response;
    }

    /**
     * Endpoint to retreive the User in the Collection "Users" of DB
     * Middleware: Validate JWT
     * In headers you must add the x-access-token with a valid JWT
     * @param {string} id Id of user to retreive (optional)
     * @returns All user o user found by iD
     */
    @Get('/me')
    public async userData(@Query()id: string): Promise<any> {
        let response: any = '';
             
        if (id) {
            LogSuccess(`[/api/users] Get User Data By ID: ${id} `);
            response = await getUserByID(id);
        }
        
        return response;
    }
    
    @Post('/logout')
    public async logoutUser(): Promise<any> {

        // let response: any = '';

        // TODO: Close Session of user
        throw new Error('Method not implemented');
    }
}
