import { IUser } from '../../domain/interfaces/IUser.interface';
import { IKata } from '../../domain/interfaces/IKata.interface';


/**
 * Error JSON response for Controllers
 */
 export type ErrorResponse = {
    code: number,
    error: string,
    message: string
}


/**
 * Basic JSON response for Controllers
 */
export type BasicResponse = {
    code: number,
    message: string
}

/**
 * Auth JSON response for Controllers
 */
 export type AuthResponse = {
    code: number,
    message: string,
    token: string,
}

/**
 * User JSON response for Controllers
 */
 export type UserResponse = {
    code: number,
    message: string,
    user: IUser,
}

/**
 * Users JSON response for Controllers
 */
 export type UsersResponse = {
    code: number,
    message: string,
    users: IUser[],
    totalPages: number,
    currentPage: number
}

/**
 * Katas from User JSON response for Controllers
 */
 export type KatasFromUserResponse = {
    code: number,
    message: string,
    user: IUser,
    katas: IKata[],
    totalPages: number,
    currentPage: number
}

/**
 * Delete Katas from User JSON response for Controllers
 */
 export type DeleteKatasFromUserResponse = {
    code: number,
    message: string,
    deletedCount: number
 }

/**
 * Kata JSON response for Controllers
 */
 export type KataResponse = {
    code: number,
    message: string,
    kata: IKata,
}

/**
 * Katas JSON response for Controllers
 */
 export type KatasResponse = {
    code: number,
    message: string,
    katas: IKata[],
    totalPages: number,
    currentPage: number
}

/**
 * Uploaded files response for Controllers
 */
export type FilesResponse = {
    code: number,
    message: string,
    files: {
            name: string,
            mimetype: string,
            size: string
    }[]
}

/**
 * Basic JSON response with the current date for Controllers
 */
 export type DateResponse = {
    code: number,
    message: string,
    date: string
}
