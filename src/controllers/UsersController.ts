import { Delete, Get, /* Post, */ Put, Query, Route, Tags, Body } from 'tsoa';

import { LogSuccess, /* LogError */ LogWarning } from '../utils/logger';
import { IUsersController } from './interfaces';
import { getAllUsers, getUserByID, deleteUserByID, updateUserByID, getKatasFromUser } from '../domain/orm/Users.orm';
import { IUserUpdate } from '../domain/interfaces/IUser.interface';
import { KataLevel } from '../domain/interfaces/IKata.interface';


@Route('/api/users')
@Tags('UsersController')
export class UsersController implements IUsersController {

    /**
     * Endpoint to retreive the Users in the Collection "Users" of DB 
     * @param {string} id Id of user to retreive (optional)
     * @returns All user o user found by iD
     */
    @Get('/')
    public async getUsers(@Query()page: number, @Query()limit: number, @Query()order: any, @Query()id?: string): Promise<any> {
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/users] Get user by ID: ${id}`);
            response = await getUserByID(id);
        } else {
            LogSuccess('[/api/users] Get all users request');
            response = await getAllUsers(page, limit, order);   
        }
        
        return response;
    }

    /**
     * Endpoint to delete the Users in the Collection "Users" of DB 
     * @param {string} id Id of user to delete (optional)
     * @returns message informing if deletion was correct
     */
    @Delete('/')
    public async deleteUser(@Query()id?: string): Promise<any> { 
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/users] Delete user by ID: ${id}`);
            await deleteUserByID(id).then(() => {
                response = {
                    message: `User with id ${id} deleted successfully`
                };
            });
        } else {
            LogWarning('[/api/users] Delete user request without ID');
            response = {
                message: 'Please, provide an ID to remove from database'
            };
        }
        
        return response;
    }

    /**
     *  Endpoint to update a User in the Collection "Users" of DB 
     * @param id Id of user to update
     * @param user IUpdateUser interface to set the new values
     * @returns 
     */
    @Put('/')
    public async updateUser(@Body()user: IUserUpdate, @Query()id?: string): Promise<any> { 
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/users] Update user by ID: ${id}`);
            await updateUserByID(user, id).then(() => {
                response = {
                    message: `User with id ${id} updated successfully`
                };
            });
        } else {
            LogWarning('[/api/users] Update user request without ID');
            response = {
                message: 'Please, provide an ID to update an existing user'
            };
        }
        
        return response;
    }

    @Get('/katas')
    public async getKatas(@Query()page: number, @Query()limit: number, @Query()order: any, @Query()id?: string, @Query()level?: KataLevel): Promise<any> {
        let response: any = '';

        if (id) {
            LogSuccess(`[/api/users/katas] Get katas from user by ID: ${id} `);
            response = await getKatasFromUser(page, limit, order, id, level);
        } else {
            LogSuccess('[/api/users/katas] Get all katas without ID');
            response = {
                message: 'ID from user is needed'
            };
        }
        
        return response; 
    }
}
