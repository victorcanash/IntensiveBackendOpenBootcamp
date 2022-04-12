import { Delete, Get, Post, Put, Query, Route, Tags } from 'tsoa';
import { IUsersController } from './interfaces';
import { LogSuccess, /* LogError */ LogWarning } from '../utils/logger';

// ORM - Users Collection
import { getAllUsers, getUserByID, deleteUserByID, createUser, updateUserByID } from '../domain/orm/Users.orm';


@Route('/api/users')
@Tags('UsersController')
export class UsersController implements IUsersController {

    /**
     * Endpoint to retreive the Users in the Collection "Users" of DB 
     * @param {string} id Id of user to retreive (optional)
     * @returns All user o user found by iD
     */
    @Get('/')
    public async getUsers(@Query()id?: string): Promise<any> {
        
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/users] Get User By ID: ${id}`);
            response = await getUserByID(id);
        } else {
            LogSuccess('[/api/users] Get All Users Request');
            response = await getAllUsers();   
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
            LogSuccess(`[/api/users] Delete User By ID: ${id}`);
            await deleteUserByID(id).then(() => {
                response = {
                    message: `User with id ${id} deleted successfully`
                };
            });
        } else {
            LogWarning('[/api/users] Delete User Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to remove from database'
            };
        }
        
        return response;
    }
    
    /**
     * Endpoint to create a new User in the Collection "Users" of DB 
     * @param {any} user User object to create
     * @returns message informing if creation was correct
     */
    @Post('/')
    public async createUser(@Query()user: any): Promise<any> {
       
        let response: any = '';

        await createUser(user).then(() => {
            LogSuccess(`[/api/users] Create User: ${user} `);
            response = {
                message: `User created successfully: ${user.name}`
            };
        });

        return response;

    }

    /**
     *  Endpoint to update a User in the Collection "Users" of DB 
     * @param id Id of user to update
     * @param user IUser obj to set the new values
     * @returns 
     */
    @Put('/')
    public async updateUser(@Query()id: string, @Query()user: any): Promise<any> {
        
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/users] Update User By ID: ${id} `);
            await updateUserByID(id, user).then(() => {
                response = {
                    message: `User with id ${id} updated successfully`
                };
            });
        } else {
            LogWarning('[/api/users] Update User Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to update an existing user'
            };
        }
        
        return response;
    }
}
