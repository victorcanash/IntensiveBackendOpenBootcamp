import { Request } from 'express';

import { IUserUpdate } from '../../domain/interfaces/IUser.interface';
import { IAuthLogin, IAuthRegister } from '@/domain/interfaces/IAuth.interface';
import { IKataStars, IKataUpdate, KataLevels } from '../../domain/interfaces/IKata.interface';
import { BasicResponse, DateResponse, KataFilesResponse, AuthResponse, UserResponse, UsersResponse, KatasFromUserResponse, KataResponse, KatasResponse, ErrorResponse, ReadableResponse } from '../types';


export interface IHelloController {
    getMessage(name?: string): Promise<BasicResponse>
}

export interface IGoodbyeController {
    getDateMessage(name?: string): Promise<DateResponse>
}

export interface IUsersController {
    getUser(id: string): Promise<UserResponse | ErrorResponse>
    getUsers(page?: number, limit?: number, order?: any): Promise<UsersResponse | ErrorResponse>
    deleteUser(id?: string): Promise<BasicResponse | ErrorResponse>
    updateUser(user: IUserUpdate, id?: string): Promise<UserResponse | ErrorResponse>
    getKatas(page?: number, limit?: number, order?: any, id?: string, level?: KataLevels): Promise<KatasFromUserResponse | ErrorResponse>
}

export interface IAuthController {
    registerUser(auth: IAuthRegister): Promise<BasicResponse | ErrorResponse>
    loginUser(auth: IAuthLogin): Promise<AuthResponse | ErrorResponse>
    getLoggedUser(): Promise<UserResponse | ErrorResponse>
    logoutUser(request: Request): Promise<BasicResponse | ErrorResponse>
}

export interface IKatasController {
    getKata(id: string): Promise<KataResponse | ErrorResponse>
    getKatas(page?: number, limit?: number, order?: any, level?: KataLevels): Promise<KatasResponse | ErrorResponse>
    createKata(kata: IKataUpdate): Promise<KataResponse | ErrorResponse>
    deleteKata(id: string): Promise<BasicResponse | ErrorResponse>
    updateKata(kata: IKataUpdate, id: string): Promise<KataResponse | ErrorResponse>
    updateKataStars(kataStars: IKataStars, id: string): Promise<KataResponse | ErrorResponse>
    getKataFile(filename: string): Promise<ReadableResponse | ErrorResponse> 
    // eslint-disable-next-line no-undef
    updateKataFiles(file: Express.Multer.File[], id: string): Promise<KataFilesResponse | ErrorResponse>
    sendKataSolution(solution: string, id: string): Promise<KataResponse | ErrorResponse>
}
