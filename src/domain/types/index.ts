import { IUser } from '../interfaces/IUser.interface';
import { IKata } from '../interfaces/IKata.interface';


/**
 * Auth JSON response for ORM
 */
 export type AuthResponse = {
    user: IUser, 
    token: string
}

/**
 * Users JSON response for ORM
 */
export type UsersResponse = {
    users: IUser[],
    totalPages: number,
    currentPage: number
}

/**
 * Katas from User JSON response for ORM
 */
 export type KatasFromUserResponse = {
    user: IUser,
    katas: IKata[],
    totalPages: number,
    currentPage: number
}
