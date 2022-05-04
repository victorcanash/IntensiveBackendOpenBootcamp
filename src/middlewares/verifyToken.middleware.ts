import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import server from '../server';
import { envConfig } from '../config';
import client from '../domain/cache';
import { MissingTokenError, BadTokenError } from '../errors';


/**
 * 
 * @param { Request } req Original request previous middleware of verification JWT
 * @param { Response } res Response to verification of JWT
 * @param { NextFunction } next Next function to be executed
 * @returns Errors of verification or next execution
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    
    // Check HEADER from Request for 'x-access-token'
    const token: any = req.headers['x-access-token'];

    // Verify if jwt is present
    if (!token) {
        const missingTokenError = new MissingTokenError('Missing JWT token in request');
        missingTokenError.logError();
        return res.status(missingTokenError.statusCode).send(missingTokenError.getResponse());
    }

    // Verify if token is in deny list
    const inDenyList = await client.get(`bl_${token}`);
    if (inDenyList) {
        const badTokenError = new BadTokenError('Failed to verify JWT token in request');
        badTokenError.logError();
        return res.status(badTokenError.statusCode).send(badTokenError.getResponse());
    }

    // Verify the token obtained
    jwt.verify(token, envConfig.SECRET_KEY, async (err: any, decoded: any) => {
        if (err) {
            const badTokenError = new BadTokenError('Failed to verify JWT token in request');
            badTokenError.logError();
            return res.status(badTokenError.statusCode).send(badTokenError.getResponse());
        }

        // Pass something to next request (object of user || other info)
        server.locals.payload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            tokenExp: decoded.exp
        };

        // Execute Next Function -> Protected Routes will be executed
        next();
    });
};
