/* eslint-disable no-unused-vars */
export enum KataLevels {
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
    level: KataLevels,
    intents: number,
    stars: {
        average: number,
        users: IKataStars[]
    },
    creator: string, // Id of user
    solution: string,
    participants: string[]
}

export interface IKataCreate {
    name: string,
    description: string,
    level: KataLevels,
    intents: number,
    creator: string,
    solution: string,
}

export interface IKataUpdate {
    name: string,
    description: string,
    level: KataLevels,
    intents: number,
    solution: string,
}
