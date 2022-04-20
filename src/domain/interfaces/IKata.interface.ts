/* eslint-disable no-unused-vars */
export enum KataLevel {
    BASIC = 'Basic',
    MEDIUM = 'Medium',
    HIGH = 'High'
}

export interface IKataStars {
    user: string, 
    stars: number
}

export interface IKata {
    name: string,
    description: string,
    level: KataLevel,
    intents: number,
    stars: {
        average: number,
        users: IKataStars[]
    },
    creator: string, // Id of user
    solution: string,
    participants: string[]
}

export interface IKataUpdate {
    name: string,
    description: string,
    level: KataLevel,
    intents: number,
    solution: string,
}
