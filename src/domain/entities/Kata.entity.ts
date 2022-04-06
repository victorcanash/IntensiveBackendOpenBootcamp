import mongoose from 'mongoose';

export const kataEntity = () => {

    const kataSchema = new mongoose.Schema(
        {
            name: String,
            description: String,
            level: Number,
            user: Number,
            date: Date,
            valoration: Number,
            chances: Number,
        }
    );

    return mongoose.model('Kata', kataSchema);

};
