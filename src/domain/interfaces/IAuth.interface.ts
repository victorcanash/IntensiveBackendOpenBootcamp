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
