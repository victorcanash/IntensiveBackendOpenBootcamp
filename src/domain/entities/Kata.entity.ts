import mongoose from 'mongoose';

import { IKata } from '../interfaces/IKata.interface';


export const kataEntity = () => {

    const kataSchema = new mongoose.Schema<IKata>(
        {
            name: { type: String, required: true },
            description: { type: String, required: true },
            level: { type: String, required: true },
            intents: { type: Number, required: true },
            stars: {
                average: { type: Number, required: true },
                users: [
                    {
                        user: { type: String, required: true },
                        stars: { type: Number, required: true }
                    }
                ]
            },
            creator: { type: String, required: true },
            solution: { type: String, required: true },
            participants: { type: [String], required: true }
        },
        { 
            timestamps: { 
                createdAt: 'created_at',
                updatedAt: 'updated_at'
            } 
        }
    );

    return mongoose.models.Katas || mongoose.model<IKata>('Katas', kataSchema);
};
