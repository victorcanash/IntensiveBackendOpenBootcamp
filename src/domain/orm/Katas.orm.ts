import { kataEntity } from '../entities/Kata.entity';
import { IKata, IKataStars, IKataUpdate, KataLevels } from '../interfaces/IKata.interface';
import { KatasResponse } from '../types';
import { ModelNotFoundError, ErrorProviders } from '../../errors';


export const getAllKatas = async (page: number, limit: number, order: {}, level?: KataLevels): Promise<KatasResponse> => {
    const kataModel = kataEntity();

    const response: KatasResponse = {} as KatasResponse;

    const levelFilter: string = (level === undefined ? '' : level);
    const levelReg: RegExp = new RegExp(levelFilter);

    await kataModel.find({ level: { $regex: levelReg } })
        .sort(order)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec().then((katas: IKata[]) => {
            response.katas = katas;
        });
    
    await kataModel.countDocuments().then((total: number) => {
        response.totalPages = Math.ceil(total / limit);
        response.currentPage = page;
    });

    return response;
};

export const getKataByID = async (id: string) : Promise<IKata> => {
    const kataModel = kataEntity();

    let foundKata: IKata = {} as IKata;

    await kataModel.findById(id).then((kataResult: IKata) => {
        foundKata = kataResult;
        if (!foundKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata can be found by ID: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });
    
    return foundKata;
};

export const deleteKataByID = async (id: string): Promise<IKata> => {
    const kataModel = kataEntity();
    
    let deletedKata: IKata = {} as IKata;

    await kataModel.findByIdAndDelete(id).then((kataResult: IKata) => {
        deletedKata = kataResult;
        if (!deletedKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata can be deleted by id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return deletedKata;
};

export const deleteKatasByID = async (ids: string[]): Promise<number> => {
    const kataModel = kataEntity();
    
    let deletedCount: number = 0;

    await kataModel.deleteMany({ id: { $in: ids } }).then((deleteResult) => {
        deletedCount = deleteResult?.deletedCount;
        if (!deleteResult?.acknowledged) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No katas can be deleted by id: ${ids}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return deletedCount;
};

export const createKata = async (kata: IKata): Promise<IKata> => { 
    const kataModel = kataEntity();

    let createdKata: IKata = {} as IKata;
    
    await kataModel.create(kata).then((kataResult: IKata) => {
        createdKata = kataResult;
        if (!createdKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, 'No kata can be created');
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return createdKata;
};

export const updateKataByID = async (kata: IKataUpdate, id: string): Promise<IKata> => {
    const kataModel = kataEntity();

    let updatedKata: IKata = {} as IKata;

    await kataModel.findByIdAndUpdate(id, kata, { returnOriginal: false }).then((kataResult: IKata) => {
        updatedKata = kataResult;
        if (!updatedKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata can be updated by id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return updatedKata;
};

export const updateKataStarsByID = async (kataStars: IKataStars, id: string): Promise<IKata> => {
    const kataModel = kataEntity();

    // Find kata
    let foundKata: IKata = {} as IKata;

    await kataModel.findById(id).then((kataResult: IKata) => {
        foundKata = kataResult;
        if (!foundKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata stars can be updated by id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    // Set stars of user and recalculate average
    const stars: number[] = [];
    let existsUser: boolean = false;
    foundKata.stars.users.forEach((item: IKataStars) => {
        if (item.user === kataStars.user) {
            item.stars = kataStars.stars;
            existsUser = true;
        }
        stars.push(item.stars);
    });
    if (!existsUser) {
        foundKata.stars.users.push(kataStars);
        stars.push(kataStars.stars);
    }
    const newAverage = stars.reduce((a: any, b: any) => a + b, 0) / stars.length;
    foundKata.stars.average = newAverage;

    // Update Kata Stars
    let updatedKata: IKata = {} as IKata;
    
    await kataModel.findByIdAndUpdate(id, foundKata, { returnOriginal: false }).then((kataResult: IKata) => {
        updatedKata = kataResult;
        if (!updatedKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata stars can be updated by id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return updatedKata;
};

export const updateKataParticipantsByID = async (id: string, participant: string) : Promise<IKata> => {
    const kataModel = kataEntity();

    // Find kata
    let foundKata: IKata = {} as IKata;

    await kataModel.findById(id).then((kataResult: IKata) => {
        foundKata = kataResult;
        if (!foundKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata participants can be updated by id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    // Set Kata Participants
    let existsParticipant: boolean = false;
    for (let i = 0; i < foundKata.participants.length; i++) {
        if (foundKata.participants[i] === participant) {
            foundKata.participants[i] = participant;
            existsParticipant = true;
            break;
        }
    }
    if (!existsParticipant) {
        foundKata.participants.push(participant);
    }

    // Update Kata Participants
    let updatedKata: IKata = {} as IKata;
    
    await kataModel.findByIdAndUpdate(id, foundKata, { returnOriginal: false }).then((kataResult: IKata) => {
        updatedKata = kataResult;
        if (!updatedKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata participants can be updated by id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return updatedKata;
};

export const existsKataParticipant = async (id: string, participant: string) : Promise<boolean> => {
    const kataModel = kataEntity();

    // Find kata
    let foundKata: IKata = {} as IKata;

    await kataModel.findById(id).then((kataResult: IKata) => {
        foundKata = kataResult;
        if (!foundKata) {
            throw new ModelNotFoundError(ErrorProviders.KATAS, `No kata can be found to check if exist a participant by kata id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    // Check Kata Participant
    for (let i = 0; i < foundKata.participants.length; i++) {
        if (foundKata.participants[i] === participant) {
            return true;
        }
    }
    return false;
};
