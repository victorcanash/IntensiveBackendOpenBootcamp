/* eslint-disable no-unused-vars */
export enum UserRoles {
    USER = 'User',
    ADMIN = 'Admin'
}

export interface IUser {
    name: string,
    email: string,
    password: string,
    role: UserRoles,
    age: number,
    katas: string[]
}

export interface IUserUpdate {
    name: string,
    age: number
}
