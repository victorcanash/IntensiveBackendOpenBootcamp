/**
 * Basic JSON response for Controllers
 */
export type BasicResponse = {
    message: string
}

/**
 * Basic JSON response with the current date for Controllers
 */
export type DateResponse = {
    message: string,
    date: string
}

/**
 * Error JSON response for Controllers
 */
export type ErrorResponse = {
    error: string,
    message: string
}

/**
 * Auth JSON response for Controllers
 */
 export type AuthResponse = {
    message: string,
    token: string
}
