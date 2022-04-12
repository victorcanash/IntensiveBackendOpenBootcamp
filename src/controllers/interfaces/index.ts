import { IUser } from '../../domain/interfaces/IUser.interface';
import { BasicResponse, DateResponse } from '../types';


export interface IHelloController {
    getMessage(name?: string): Promise<BasicResponse>
}

export interface IGoodbyeController {
    getDateMessage(name?: string): Promise<DateResponse>
}

export interface IUsersController {
    // Read all users from database || get User By ID
    getUsers(id?: string): Promise<any>
    // Delete User By ID
    deleteUser(id?: string): Promise<any>
    // Create new User
    createUser(user: any): Promise<any>
    // Update user
    updateUser(id: string, user: any): Promise<any>
}

export interface IAuthController {
    // register users
    registerUser(user: IUser): Promise<any>
    // login user
    loginUser(auth: any): Promise<any>
}
