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
    creator: string,
    participants: string[],
    files: string[]
}

export interface IKataUpdate {
    name: string,
    description: string,
    level: KataLevels,
    intents: number
}
