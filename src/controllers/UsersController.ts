import { Delete, Get, Put, Route, Query, Tags, Body, Security, Response, SuccessResponse } from 'tsoa';
import { StatusCodes } from 'http-status-codes';

import { IUsersController } from './interfaces';
import { ErrorResponse, BasicResponse, UserResponse, UsersResponse, KatasFromUserResponse, DeleteKatasFromUserResponse } from './types';
import server from '../server';
import { SomethingWrongError, BaseError, ErrorProviders, ErrorTypes } from '../errors';
import { LogSuccess } from '../utils/logger';
import { getAllUsers, getUserByID, getUserByEmail, deleteUserByEmail, updateUserByEmail, getKatasFromUser } from '../domain/orm/Users.orm';
import { deleteKatasByID } from '../domain/orm/Katas.orm';
import { IUser, IUserUpdate } from '../domain/interfaces/IUser.interface';
import { KataLevels } from '../domain/interfaces/IKata.interface';
import { UsersResponse as UsersORMResponse, KatasFromUserResponse as KatasORMResponse } from '../domain/types';


@Route('/api/users')
@Tags('UsersController')
export class UsersController implements IUsersController {
    private readonly somethingWrongError = new SomethingWrongError(ErrorProviders.USERS);


    @Get('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async getUsers(@Query()page: number, @Query()limit: number, @Query()order: any, @Query()id?: string): Promise<UserResponse | UsersResponse | ErrorResponse> {
        let response: UserResponse | UsersResponse | ErrorResponse = this.somethingWrongError.getResponse();
        
        if (id) {
            await getUserByID(id).then((foundUser: IUser) => {
                response = {
                    code: StatusCodes.OK,
                    message: 'User found successfully',
                    user: foundUser
                };
                LogSuccess(`[/api/users] Get user by ID: ${id}`);

            }).catch((error: BaseError) => {
                response = error.getResponse();
            });

        } else {
            await getAllUsers(page, limit, order).then((usersResponse: UsersORMResponse) => {
                response = {
                    code: StatusCodes.OK,
                    message: 'Users found successfully',
                    users: usersResponse.users,
                    totalPages: usersResponse.totalPages,
                    currentPage: usersResponse.currentPage
                };
                LogSuccess('[/api/users] Get all users');

            }).catch((error: BaseError) => {
                response = error.getResponse();
            }); 
        }
        
        return response;
    }

    @Delete('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async deleteUser(): Promise<BasicResponse | ErrorResponse> { 
        let response: BasicResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email: any = server.locals.payload?.email;

        await deleteUserByEmail(email).then((deletedUser: IUser) => {
            response = {
                code: StatusCodes.OK,
                message: `User with email: ${deletedUser.email} deleted successfully`
            };
            LogSuccess(`[/api/users] Delete user by email: ${deletedUser.email}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @Put('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async updateUser(@Body()user: IUserUpdate): Promise<BasicResponse | ErrorResponse> { 
        let response: BasicResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email: any = server.locals.payload?.email;
        
        await updateUserByEmail(user, email).then((updatedUser: IUser) => {
            response = {
                code: StatusCodes.OK,
                message: `User with email: ${updatedUser.email} updated successfully`
            };
            LogSuccess(`[/api/users] Update user by email: ${updatedUser.email}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @Get('/katas')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async getKatas(@Query()page: number, @Query()limit: number, @Query()order: any, @Query()id: string, @Query()level?: KataLevels): Promise<KatasFromUserResponse | ErrorResponse> {
        let response: KatasFromUserResponse | ErrorResponse = this.somethingWrongError.getResponse();

        await getKatasFromUser(page, limit, order, id, level).then((katasResponse: KatasORMResponse) => {
            response = {
                code: StatusCodes.OK,
                message: 'Katas from user found successfully',
                user: katasResponse.user,
                katas: katasResponse.katas,
                totalPages: katasResponse.totalPages,
                currentPage: katasResponse.currentPage
            };
            LogSuccess(`[/api/users/katas] Get katas from user by ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response; 
    }

    @Delete('/katas')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async deleteKatas(): Promise<DeleteKatasFromUserResponse | ErrorResponse> { 
        let response: DeleteKatasFromUserResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email: any = server.locals.payload?.email;

        let foundUser = {} as IUser;

        await getUserByEmail(email).then((userResult: IUser) => {
            foundUser = userResult;
            
        }).catch((error: BaseError) => {
            error.logError();
            response = error.getResponse();
        });

        if (!foundUser) {
            return response;
        }

        let deletedCount = -1;
        await deleteKatasByID(foundUser.katas).then((countResult: number) => {
            deletedCount = countResult;

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        if (deletedCount === -1) {
            return response;
        }

        const katas = foundUser.katas;
        foundUser.katas = [];
        await updateUserByEmail(foundUser, foundUser.email).then((updatedUser: IUser) => {
            response = {
                code: StatusCodes.OK,
                message: `Katas from user deleted successfully with email: ${updatedUser.email} and with ${katas.length} katas id: [${katas}]`,
                deletedCount: deletedCount
            };
            LogSuccess(`[/api/users/katas] Delete katas from user with email: ${updatedUser.email} and with ${katas.length} katas id: [${katas}]`);
        
        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }
}
