import { IUser } from '../../domain/interfaces/IUser.interface';


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
 * Auth JSON response for Controllers
 */
 export type UserResponse = {
    code: number,
    message: string,
    user: IUser,
}

/**
 * Basic JSON response with the current date for Controllers
 */
 export type DateResponse = {
    code: number,
    message: string,
    date: string
}
