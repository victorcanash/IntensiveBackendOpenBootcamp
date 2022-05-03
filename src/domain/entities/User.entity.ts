import mongoose from 'mongoose';

import { IUser } from '../interfaces/IUser.interface';


export const userEntity = () => {

    const userSchema = new mongoose.Schema<IUser>(
        {
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, required: true },
            age: { type: Number, required: true },
            katas: { type: [String], required: true }
        },
        { 
            timestamps: { 
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            } 
        }
    );

    return mongoose.models.Users || mongoose.model<IUser>('Users', userSchema);
};
