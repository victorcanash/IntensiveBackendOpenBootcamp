import { Request } from 'express';

import { IUserUpdate } from '../../domain/interfaces/IUser.interface';
import { IAuthLogin, IAuthRegister } from '@/domain/interfaces/IAuth.interface';
import { IKataStars, IKataUpdate, KataLevels } from '../../domain/interfaces/IKata.interface';
import { BasicResponse, DateResponse, AuthResponse, UserResponse, UsersResponse, KatasFromUserResponse, KataResponse, KatasResponse, ErrorResponse } from '../types';


export interface IHelloController {
    getMessage(name?: string): Promise<BasicResponse>
}

export interface IGoodbyeController {
    getDateMessage(name?: string): Promise<DateResponse>
}

export interface IUsersController {
    // Get all users from database with pagination || Get user by id
    getUsers(page?: number, limit?: number, order?: any, id?: string): Promise<UserResponse | UsersResponse | ErrorResponse>
    // Delete logged user
    deleteUser(id?: string): Promise<BasicResponse | ErrorResponse>
    // Update logged user
    updateUser(user: IUserUpdate, id?: string): Promise<BasicResponse | ErrorResponse>
    // Get Katas of user with pagination
    getKatas(page?: number, limit?: number, order?: any, id?: string, level?: KataLevels): Promise<KatasFromUserResponse | ErrorResponse>
}

export interface IAuthController {
    // Register users
    registerUser(auth: IAuthRegister): Promise<BasicResponse | ErrorResponse>
    // Login user
    loginUser(auth: IAuthLogin): Promise<AuthResponse | ErrorResponse>
    // Get logged user
    getLoggedUser(): Promise<UserResponse | ErrorResponse>
    // Logout user
    logoutUser(request: Request): Promise<BasicResponse | ErrorResponse>
}

export interface IKatasController {
    // Get all katas from database with pagination || Get kata By ID
    getKatas(page?: number, limit?: number, order?: any, id?: string, level?: KataLevels): Promise<KataResponse | KatasResponse | ErrorResponse>
    // Create New Kata
    createKata(kata: IKataUpdate): Promise<BasicResponse | ErrorResponse>
    // Delete Kata By ID
    deleteKata(id: string): Promise<BasicResponse | ErrorResponse>
    // Update Kata
    updateKata(kata: IKataUpdate, id: string): Promise<BasicResponse | ErrorResponse>
    // Update Kata Stars
    updateKataStars(kataStars: IKataStars, id: string): Promise<BasicResponse | ErrorResponse>
    // Check Kata Solution
    sendKataSolution(solution: string, id: string): Promise<BasicResponse | ErrorResponse>
    // Update kata file
    // eslint-disable-next-line no-undef
    updateKataFile(file: Express.Multer.File): Promise<BasicResponse | ErrorResponse>
}
