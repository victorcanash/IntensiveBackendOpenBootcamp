import { UserRoles } from './IUser.interface';

export interface IAuthRegister {
    name: string,
    email: string,
    password: string,
    age: number
}

export interface IAuthLogin {
    email: string,
    password: string
}

export interface IAuthPayload {
    id: string,
    email: string,
    role: UserRoles
}
