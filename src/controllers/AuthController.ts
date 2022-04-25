import { Get, Post, Route, Tags, Body, Security, Response, SuccessResponse } from 'tsoa';
import { StatusCodes } from 'http-status-codes';

import { IAuthController } from './interfaces';
import { ErrorResponse, BasicResponse, AuthResponse, UserResponse } from './types';
import server from '../server';
import { SomethingWrongError, BaseError, ErrorProviders, ErrorTypes } from '../errors';
import { LogSuccess } from '../utils/logger';
import { registerUser, loginUser /* ,logoutUser */ } from '../domain/orm/Auth.orm';
import { getUserByEmail } from '../domain/orm/Users.orm';
import { IUser } from '../domain/interfaces/IUser.interface';
import { IAuthLogin, IAuthRegister } from '../domain/interfaces/IAuth.interface';


@Route('/api/auth')
@Tags('AuthController')
export class AuthController implements IAuthController {
    private readonly somethingWrongError = new SomethingWrongError(ErrorProviders.AUTH);


    @Post('/register')
    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async registerUser(@Body()auth: IAuthRegister): Promise<BasicResponse | ErrorResponse> {
        const user: IUser = {
            name: auth.name,
            email: auth.email,
            password: auth.password,
            age: auth.age,
            katas: []
        };
        
        let response: BasicResponse | ErrorResponse = this.somethingWrongError.getResponse();

        await registerUser(user).then((createdUser: IUser | undefined) => {
            response = {
                code: StatusCodes.CREATED,
                message: `User registered successfully: ${createdUser?.email}`
            };
            LogSuccess(`[/api/auth/register] Registered user: ${createdUser?.email}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        return response;
    }

    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    @Post('/login')
    public async loginUser(@Body()auth: IAuthLogin): Promise<AuthResponse | ErrorResponse> {
        let response: AuthResponse | ErrorResponse = this.somethingWrongError.getResponse();

        await loginUser(auth).then((result: {user: IUser | undefined, token: string | undefined}) => {
            response = {
                code: StatusCodes.CREATED,
                message: `User logged in successfully: ${result.user?.email}`,
                token: result.token || ''
            };
            LogSuccess(`[/api/auth/login] Logged in user: ${result.user?.email}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    @Security('jwt')
    @Get('/me')
    public async getLoggedUser(): Promise<UserResponse | ErrorResponse> {
        let response: UserResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email = server.locals.loggedEmail;

        await getUserByEmail(email).then((foundUser: IUser | undefined) => {
            response = {
                code: StatusCodes.OK,
                message: 'User found successfully',
                user: foundUser || {} as IUser
            };
            LogSuccess(`[/api/auth/me] Get logged user by email: ${foundUser?.email}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
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
