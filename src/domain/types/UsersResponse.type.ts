import { IUser } from '../interfaces/IUser.interface';


export type UsersResponse = {
    users: IUser[],
    totalPages: number,
    currentPage: number
}
