import mongoose from 'mongoose';

import { userEntity } from '../entities/User.entity';
import { kataEntity } from '../entities/Kata.entity';
import { IUserUpdate, IUser } from '../interfaces/IUser.interface';
import { IKata, KataLevel } from '../interfaces/IKata.interface';
import { UsersResponse, KatasFromUserResponse } from '../types';
import { ModelNotFoundError, ErrorProviders } from '../../errors';


const modelSelect: string = 'name email age katas created_at updated_at';

export const getAllUsers = async (page: number, limit: number, order: {}): Promise<UsersResponse> => {
    const userModel = userEntity();

    const response: UsersResponse = {} as UsersResponse;

    await userModel.find({ isDeleted: false })
        .sort(order)
        .select(modelSelect)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec().then((users: IUser[]) => {
            response.users = users;
        });

    await userModel.countDocuments().then((total: number) => {
        response.totalPages = Math.ceil(total / limit);
        response.currentPage = page;
    });

    return response;
};

export const getUserByID = async (id: string) : Promise<IUser> => {
    const userModel = userEntity();

    let foundUser: IUser = {} as IUser;

    await userModel.findById(id).select(modelSelect).then((userResult: IUser) => {
        foundUser = userResult;
        if (!foundUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user can be found by ID: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });
    
    return foundUser;
};

 export const getUserByEmail = async (email: string) : Promise<IUser> => {
    const userModel = userEntity();

    let foundUser: IUser = {} as IUser;

    await userModel.findOne({ email: email }).select(modelSelect).then((userResult: IUser) => {
        foundUser = userResult;
        if (!foundUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user can be found by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });
    
    return foundUser;
};

export const deleteUserByEmail = async (email: string): Promise<IUser> => {
    const userModel = userEntity();
    
    let deletedUser: IUser = {} as IUser;

    await userModel.findOneAndDelete({ email: email }).then((userResult: IUser) => {
        deletedUser = userResult;
        if (!deletedUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user can be deleted by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return deletedUser;
};

export const updateUserByEmail = async (user: IUserUpdate, email: string): Promise<IUser> => {
    const userModel = userEntity();

    let updatedUser: IUser = {} as IUser;

    await userModel.findOneAndUpdate({ email: email }, user, { returnOriginal: false }).then((userResult: IUser) => {
        updatedUser = userResult;
        if (!updatedUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user can be updated by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    return updatedUser;
};

/* KATAS */

export const addUserKataByEmail = async (kataId: string, email: string): Promise<IUser> => {
    const userModel = userEntity();

    let foundUser: IUser = {} as IUser;

    // Find user
    await userModel.findOne({ email: email }).then((userResult: IUser) => {
        foundUser = userResult;
        if (!foundUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user kata can be added by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    // Add kata from user katas array
    let updatedUser = foundUser;
    updatedUser.katas.push(kataId);

    // Update user
    await userModel.findOneAndUpdate({ email: email }, updatedUser, { returnOriginal: false }).then((userResult: IUser) => {
        updatedUser = userResult;
        if (!updatedUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user kata can be added by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    }); 

    return updatedUser;
};

export const deleteUserKataByEmail = async (kataId: string, email: string): Promise<IUser> => {
    const userModel = userEntity();

    let foundUser: IUser = {} as IUser;

    // Find user
    await userModel.findOne({ email: email }).then((userResult: IUser) => {
        foundUser = userResult;
        if (!foundUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user kata can be deleted by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    // Delete kata from user katas array
    let updatedUser = foundUser;
    updatedUser.katas = updatedUser.katas.filter((item: string) => item !== kataId);

    // Update user
    await userModel.findOneAndUpdate({ email: email }, updatedUser, { returnOriginal: false }).then((userResult: IUser) => {
        updatedUser = userResult;
        if (!updatedUser) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user kata can be deleted by email: ${email}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    }); 

    return updatedUser;
};

export const getKatasFromUser = async (page: number, limit: number, order: {}, id: string, level?: KataLevel): Promise<KatasFromUserResponse> => {
    const userModel = userEntity();
    const kataModel = kataEntity();

    const response = {} as KatasFromUserResponse;

    await userModel.findById(id).select(modelSelect).then(async (userResult: IUser) => {
        response.user = userResult;
        if (!response.user) {
            throw new ModelNotFoundError(ErrorProviders.USERS, `No user can be found to get its Katas with id: ${id}`);
        }
    }).catch((error: ModelNotFoundError) => {
        error.logError();
        throw error;
    });

    const objectIds: mongoose.Types.ObjectId[] = [];
    response.user.katas.forEach((kataID: string) => {
        const objectID = new mongoose.Types.ObjectId(kataID);
        objectIds.push(objectID);
    });

    const levelFilter: string = (level === undefined ? '' : level);
    const levelReg: RegExp = new RegExp(levelFilter);

    await kataModel.find({ '_id': { '$in': objectIds }, level: { $regex: levelReg } })
        .sort(order)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec().then((katas: IKata[]) => {
            response.katas = katas;
        });

    await kataModel.countDocuments({ '_id': { '$in': objectIds }, level: { $regex: levelReg } })
        .then((total: number) => {
            response.totalPages = Math.ceil(total / limit);
            response.currentPage = page;
    });

    return response;
};

export const isKataFromUser = async (email: string, kataId: string): Promise<boolean> => {
    const userModel = userEntity();

    let response: boolean = false;

    await userModel.findOne({ email: email, katas: kataId }).then((foundUser: IUser) => {
        if (foundUser) {
            response = true;
        }
    });

    return response;
};
