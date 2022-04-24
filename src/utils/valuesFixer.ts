import { KataLevel } from '../domain/interfaces/IKata.interface';


export const fixNumberValue = (value: number, min: number, max: number, round: boolean = false) => {
    let newValue = value;
    if (newValue < min) {
        newValue = min;
    } else if (newValue > max) {
        newValue = max;
    }
    newValue = round ? Math.round(newValue) : newValue;
    return newValue;
};

export const fixKataLevelValue = (level: string) => {
    let newLevel = level;
    if (newLevel.toUpperCase().includes('MEDIUM')) {
        newLevel = KataLevel.MEDIUM;
    } else if (level.toUpperCase().includes('HIGH')) {
        newLevel = KataLevel.HIGH;
    } else {
        newLevel = KataLevel.BASIC;
    }
    return newLevel;
};
