export interface IUser {
    name: string,
    email: string,
    password: string,
    age: number,
    katas: string[]
}

export interface IUpdateUser {
    name: string,
    age: number
}
