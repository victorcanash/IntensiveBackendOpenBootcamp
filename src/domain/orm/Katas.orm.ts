// Environment variables
import dotenv from 'dotenv';

import { /* LogSuccess, */ LogError } from '../../utils/logger';
import { kataEntity } from '../entities/Kata.entity';
import { IKata, IKataUpdate, KataLevel } from '../interfaces/IKata.interface';


// Configuration of environment variables
dotenv.config();

// CRUD

/**
 * Method to obtain all Katas from Collection "Katas" in Mongo Server
 */
export const getAllKatas = async (page: number, limit: number, order: {}, level?: KataLevel): Promise<any[] | undefined> => {
    try {
        const kataModel = kataEntity();
        const response: any = {};

        // Filter by level
        const levelFilter: string = (level === undefined ? '' : level);
        const levelReg: RegExp = new RegExp(levelFilter);

        // Search Katas (using pagination)
        await kataModel.find({ level: { $regex: levelReg } })
            .sort(order)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec().then((katas: IKata[]) => {
                response.katas = katas;
            });
        
        // Count total documents in collection "Katas"
        await kataModel.countDocuments().then((total: number) => {
            response.totalPages = Math.ceil(total / limit);
            response.currentPage = page;
        });

        return response;

    } catch (error) {
        LogError(`[ORM ERROR]: Getting All Katas: ${error}`);
    }
};

// - Get Kata By ID
export const getKataByID = async (id: string) : Promise<any | undefined> => {
    try {
        const kataModel = kataEntity();

        // Search Kata By ID
        return await kataModel.findById(id);

    } catch (error) {
        LogError(`[ORM ERROR]: Getting Kata By ID: ${error}`);
    }

};

// - Delete Kata By ID
export const deleteKataByID = async (id: string): Promise<any | undefined> => {
    try {
        const kataModel = kataEntity();

        // Delete Kata BY ID
        return await kataModel.findByIdAndDelete({ _id: id });

    } catch (error) {
        LogError(`[ORM ERROR]: Deleting Kata By ID: ${error}`);
    }
};

// - Create New Kata
export const createKata = async (kata: IKata): Promise<any | undefined> => {
    try { 
        const kataModel = kataEntity();

        // Create / Insert new Kata
        return await kataModel.create(kata);

    } catch (error) {
        LogError(`[ORM ERROR]: Creating Kata: ${error}`);
    }
};

// - Update Kata By ID
export const updateKataByID = async (kata: IKataUpdate, id: string): Promise<any | undefined> => {
    try {
        const kataModel = kataEntity();

        // Update Kata
        return await kataModel.findByIdAndUpdate(id, kata);

    } catch (error) {
        LogError(`[ORM ERROR]: Updating Kata ${id}: ${error}`);
    }
};

// - kataFromUser
export const getKataFromUser = async (id: string, userId: string) : Promise<any | undefined> => {
    try {
        const kataModel = kataEntity();

        // Search Kata By ID
        return await kataModel.findOne({ _id: id, creator: userId });

    } catch (error) {
        LogError(`[ORM ERROR]: Is Kata ${id} From User {$userId}: ${error}`);
    }
};
