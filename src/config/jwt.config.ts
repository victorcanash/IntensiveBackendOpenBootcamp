import jwt from 'jsonwebtoken';


export const jwtSignOptions: jwt.SignOptions = {
    expiresIn: '3h'
};
