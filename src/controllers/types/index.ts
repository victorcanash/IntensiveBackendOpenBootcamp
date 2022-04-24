/**
 * Basic JSON response with the current date for Controllers
 */
 export type DateResponse = {
    status: number,
    message: string,
    date: string
}

/**
 * Basic JSON response for Controllers
 */
export type BasicResponse = {
    status: number,
    message: string
}

/**
 * Error JSON response for Controllers
 */
export type ErrorResponse = {
    status: number,
    error: string,
    message: string
}

/**
 * Auth JSON response for Controllers
 */
 export type AuthResponse = {
    status: number,
    message: string,
    token: string,
}
