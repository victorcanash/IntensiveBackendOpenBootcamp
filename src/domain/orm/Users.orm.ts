import { /* LogSuccess, */ LogError } from '../../utils/logger';
import { userEntity } from '../entities/User.entity';
import { kataEntity } from '../entities/Kata.entity';
import { IUser } from '../interfaces/IUser.interface';
import { IAuth } from '../interfaces/IAuth.interface';
import { IKata, KataLevel } from '../interfaces/IKata.interface';
// import { UserResponse } from '../types/UsersResponse.type';

// Environment variables
import dotenv from 'dotenv';
// BCRYPT for passwords
import bcrypt from 'bcrypt';
// JWT
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


// Configuration of environment variables
dotenv.config();

// Obtain Secret key to generate JWT
const secret = process.env.SECRETKEY || 'MYSECRETKEY';

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
    }
};

/**
 * Method to update a User from Collection "Users" passing its id and IUser object with the values to set in Mongo Server
 */
export const updateUserByID = async (id: string, user: any): Promise<any | undefined> => {
    try { 
        const userModel = userEntity();

        // Update User
        return await userModel.findByIdAndUpdate(id, user);

    } catch (error) {
        LogError(`[ORM ERROR]: Updating User ${id}: ${error}`);
    }
};

/**
 * Method to register/create a User from Collection "Users" passing its IUser in Mongo Server
 */
export const registerUser = async (user: IUser): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        // Create / Insert new User
        return await userModel.create(user);

    } catch (error) {
        LogError(`[ORM ERROR]: Creating User: ${error}`);
    }
};

/**
 * Method to login a User from Collection "Users" passing its IAuth in Mongo Server
 */
export const loginUser = async (auth: IAuth): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        let userFound: IUser | undefined = undefined;
        let token: string | undefined = undefined;

        // Check if user exists by unique email
        await userModel.findOne({ email: auth.email }).then((user: IUser) => {
            userFound = user;
        }).catch((error) => {
            console.error('[ERROR Authentication in ORM]: User Not Found');
            throw new Error(`[ERROR Authentication in ORM]: User Not Found: ${error}`);
        });

        // Check if password is valid (compare with bcrypt)
        const validPassword = bcrypt.compareSync(auth.password, userFound!.password);

        if (!validPassword) {
            console.error('[ERROR Authentication in ORM]: Password not valid');
            throw new Error('[ERROR Authentication in ORM]: Password not valid');
        }
        
        // Generate our JWT
        token = jwt.sign({ email: userFound!.email }, secret, {
            expiresIn: '2h'
        });

        return {
            user: userFound,
            token: token
        };

    } catch (error) {
        LogError(`[ORM ERROR]: Logging User: ${error}`);
    }
};

/**
 * Method to logout the current connected user in Mongod Server
 */
export const logoutUser = async (): Promise<any | undefined> => {
    // TODO: NOT IMPLEMENTED
};

/**
 * Method to obtain all Katas Collection from logged User in Mongo Server
 */
 export const getKatasFromUser = async (page: number, limit: number, id: string, order: {}, level?: KataLevel): Promise<any[] | undefined> => {
    try {
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
        });

        return response;

    } catch (error) {
        LogError(`[ORM ERROR]: Getting All Users: ${error}`);
    }
};
