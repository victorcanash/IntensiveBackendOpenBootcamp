import { userEntity } from '../entities/User.entity';

import { /* LogSuccess, */ LogError } from '../../utils/logger';
import { IUser } from '../interfaces/IUser.interface';
import { IAuth } from '../interfaces/IAuth.interface';

// BCRYPT for passwords
import bcrypt from 'bcrypt';

// JWT
import jwt from 'jsonwebtoken';


// CRUD

/**
 * Method to obtain all Users from Collection "Users" in Mongo Server
 */
 export const getAllUsers = async (): Promise<any[] | undefined> => {
    try {
        const userModel = userEntity();

        // Search all users
        return await userModel.find({ isDelete: false });

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
        return await userModel.findById(id);

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

        // Delete User BY ID
        return await userModel.deleteOne({ _id: id });

    } catch (error) {
        LogError(`[ORM ERROR]: Deleting User By ID: ${error}`);
    }
};

/**
 * Method to create a User from Collection "Users" passing a IUser object in Mongo Server
 */
export const createUser = async (user: any): Promise<any | undefined> => {
    try {  
        const userModel = userEntity();

        // Create / Insert new User
        return await userModel.create(user);

    } catch (error) {
        LogError(`[ORM ERROR]: Creating User: ${error}`);
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

// Register User
export const registerUser = async (user: IUser): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        // Create / Insert new User
        return await userModel.create(user);

    } catch (error) {
        LogError(`[ORM ERROR]: Creating User: ${error}`);
    }
};

// Login User
export const loginUser = async (auth: IAuth): Promise<any | undefined> => {
    try {
        const userModel = userEntity();

        // Find User by email
        userModel.findOne({ email: auth.email }, (err: any, user: IUser) => {
            if (err) {
                // TODO: return ERROR --> ERROR while searching (500)
            }

            if (!user) {
                // TODO: return ERROR --> ERROR USER NOT FOUND (404)
            }

            // Use Bcrypt to Compare Passwords            
            const validPassword = bcrypt.compareSync(auth.password, user.password);

            if (!validPassword) {
                // TODO --> NOT AUTHORISED (401) 
            }

            // Create JWT
            // TODO: Secret must be in .env
            const token = jwt.sign({ email: user.email }, 'MYSECRETWORD', {
                expiresIn: '2h'
            });


            return token;

        });

    } catch (error) {
        LogError(`[ORM ERROR]: Creating User: ${error}`);
    }
};

// Logout User
export const logoutUser = async (): Promise<any | undefined> => {
    // TODO: NOT IMPLEMENTED
};

