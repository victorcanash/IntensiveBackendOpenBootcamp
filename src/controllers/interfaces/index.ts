import { IUserUpdate, IUser } from '../../domain/interfaces/IUser.interface';
import { IAuth } from '@/domain/interfaces/IAuth.interface';
import { IKata, IKataStars, IKataUpdate, KataLevel } from '../../domain/interfaces/IKata.interface';
import { BasicResponse, DateResponse } from '../types';


export interface IHelloController {
    getMessage(name?: string): Promise<BasicResponse>
}

export interface IGoodbyeController {
    getDateMessage(name?: string): Promise<DateResponse>
}

export interface IUsersController {
    // Get all users from database with pagination || Get User By ID
    getUsers(page: number, limit: number, order: any, id?: string): Promise<any>
    // Delete User By ID
    deleteUser(id?: string): Promise<any>
    // Update user
    updateUser(user: IUserUpdate, id?: string): Promise<any>
    // Get Katas of User with pagination
    getKatas(page: number, limit: number, order: any, id?: string, level?: KataLevel): Promise<any>
}

export interface IAuthController {
    // Register users
    registerUser(user: IUser): Promise<any>
    // Login user
    loginUser(auth: IAuth): Promise<any>
    // Get logged user
    getLoggedUser(id: string): Promise<any>
    // Logout user
    logoutUser(): Promise<any>
}

export interface IKatasController {
    // Get all katas from database with pagination || Get kata By ID
    getKatas(page: number, limit: number, order: any, id?: string, level?: KataLevel): Promise<any>
    // Create New Kata
    createKata(kata: IKata): Promise<any>
    // Delete Kata By ID
    deleteKata(id?: string, userId?: string): Promise<any>
    // Update Kata
    updateKata(kata: IKataUpdate, id?: string, userId?: string): Promise<any>
    // UpdateKataStars
    updateKataStars(kataStars: IKataStars, id?: string): Promise<any>
}
