import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import server from '../server';
import client from '../domain/cache';
import { MissingTokenError, BadTokenError } from '../errors';


// Config dotenv to read environment variables
dotenv.config();

const secret = process.env.SECRETKEY || 'MYSECRETKEY';

const clearLocals = () => {
    server.locals.loggedEmail = null;
    server.locals.tokenExp = null;
};

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
        clearLocals();
        const missingTokenError = new MissingTokenError('Missing JWT token in request');
        missingTokenError.logError();
        return res.status(missingTokenError.statusCode).send(missingTokenError.getResponse());
    }

    // Verify if token is in deny list
    const inDenyList = await client.get(`bl_${token}`);
    if (inDenyList) {
        clearLocals();
        const badTokenError = new BadTokenError('Failed to verify JWT token in request');
        badTokenError.logError();
        return res.status(badTokenError.statusCode).send(badTokenError.getResponse());
    }

    // Verify the token obtained
    jwt.verify(token, secret, async (err: any, decoded: any) => {
        if (err) {
            clearLocals();
            const badTokenError = new BadTokenError('Failed to verify JWT token in request');
            badTokenError.logError();
            return res.status(badTokenError.statusCode).send(badTokenError.getResponse());
        }
        console.log(decoded);

        // Pass something to next request (object of user || other info)
        server.locals.loggedEmail = decoded.email;
        server.locals.tokenExp = decoded.exp;

        // Execute Next Function -> Protected Routes will be executed
        next();
    });
};
