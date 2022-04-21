import mongoose from 'mongoose';

import { /* LogSuccess, */ LogError } from '../../utils/logger';
import { userEntity } from '../entities/User.entity';
import { kataEntity } from '../entities/Kata.entity';
import { IUserUpdate, IUser } from '../interfaces/IUser.interface';
import { IKata, KataLevel } from '../interfaces/IKata.interface';
// import { UserResponse } from '../types/UsersResponse.type';


// CRUD

/**
 * Method to obtain all Users from Collection "Users" in Mongo Server
 */
 export const getAllUsers = async (page: number, limit: number, order: {}): Promise<any[] | undefined> => {
    try {
        const userModel = userEntity();

        const response: any = {};

        // Search all users (using pagination)
        await userModel.find({ isDeleted: false })
            .sort(order)
            .select('name email age katas created_at updated_at')
            .limit(limit)
            .skip((page - 1) * limit)
            .exec().then((users: IUser[]) => {
                response.users = users;
            });

        // Count total documents in collection "Users"
        await userModel.countDocuments().then((total: number) => {
            response.totalPages = Math.ceil(total / limit);
            response.currentPage = page;
        });

        return response;

    } catch (error) {
        LogError(`[ORM ERROR]: Getting All Users: ${error}`);
        throw new Error(`[ORM ERROR]: Getting All Users: ${error}`);
    }
};

/**
 * Method to obtain a User from Collection "Users" passing its id in Mongo Server
 */
export const getUserByID = async (id: string) : Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        // Search User By ID
        return await userModel.findById(id).select('name email age katas created_at updated_at');

    } catch (error) {
        LogError(`[ORM ERROR]: Getting User By ID: ${error}`);
        throw new Error(`[ORM ERROR]: Getting User By ID: ${error}`);
    }
};

/**
 * Method to obtain a User from Collection "Users" passing its email in Mongo Server
 */
 export const getUserByEmail = async (email: string) : Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        // Search User By Email
        return await userModel.findOne({ email: email }).select('name email age katas created_at updated_at');

    } catch (error) {
        LogError(`[ORM ERROR]: Getting User By Email: ${error}`);
        throw new Error(`[ORM ERROR]: Getting User By Email: ${error}`);
    }
};

/**
 * Method to delete a User from Collection "Users" passing its id in Mongo Server
 */
export const deleteUserByID = async (id: string): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        // Delete User by ID
        return await userModel.deleteOne({ _id: id });

    } catch (error) {
        LogError(`[ORM ERROR]: Deleting User By ID: ${error}`);
        throw new Error(`[ORM ERROR]: Deleting User By ID: ${error}`);
    }
};

/**
 * Method to update a User from Collection "Users" passing its id and IUser object with the values to set in Mongo Server
 */
export const updateUserByID = async (user: IUserUpdate, id: string): Promise<any | undefined> => {
    try { 
        const userModel = userEntity();

        // Update User
        return await userModel.findByIdAndUpdate(id, user);

    } catch (error) {
        LogError(`[ORM ERROR]: Updating User ${id}: ${error}`);
        throw new Error(`[ORM ERROR]: Updating User ${id}: ${error}`);
    }
};

/**
 * Method to obtain all Katas Collection from logged User in Mongo Server
 */
 export const getKatasFromUser = async (page: number, limit: number, order: {}, id: string, level?: KataLevel): Promise<any[] | undefined> => {
    const userModel = userEntity();
    const kataModel = kataEntity();
    const response: any = {};

    await userModel.findById(id).then(async (user: IUser) => {
        response.user = user.email;

        // Create types to search
        const objectIds: mongoose.Types.ObjectId[] = [];
        user.katas.forEach((kataID: string) => {
            const objectID = new mongoose.Types.ObjectId(kataID);
            objectIds.push(objectID);
        });

        // Filter by level
        const levelFilter: string = (level === undefined ? '' : level);
        const levelReg: RegExp = new RegExp(levelFilter);

        // Search Katas (using pagination)
        await kataModel.find({ '_id': { '$in': objectIds }, level: { $regex: levelReg } })
            .sort(order)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec().then((katas: IKata[]) => {
                response.katas = katas;
            });

        // Count total documents in collection "Katas"
        await kataModel.countDocuments({ '_id': { '$in': objectIds }, level: { $regex: levelReg } })
            .then((total: number) => {
                response.totalPages = Math.ceil(total / limit);
                response.currentPage = page;
        });

    }).catch((error) => {
        LogError(`[ORM ERROR]: Obtaining User: ${error}`);
        throw new Error(`[ORM ERROR]: Obtaining User: ${error}`);
    });

    return response;
};
