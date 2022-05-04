import { Request, Response, NextFunction } from 'express';

import server from '../server';
import { UserRoles } from '../domain/interfaces/IUser.interface';
import { MissingRoleError } from '../errors';


export const verifyRole = (...permittedRoles: UserRoles[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = server.locals.payload?.loggedRole;

        if (userRole && permittedRoles.includes(userRole)) {
            next(); 
        } else {
            const missingRoleError = new MissingRoleError(`Cannot access with role: ${userRole}`);
            missingRoleError.logError();
            return res.status(missingRoleError.statusCode).send(missingRoleError.getResponse());
        }
    };
};
