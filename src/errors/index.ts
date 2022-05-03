import { StatusCodes } from 'http-status-codes';

import { LogError } from '../utils/logger';
import { ErrorResponse } from '../controllers/types';


/* eslint-disable no-unused-vars */
export enum ErrorProviders {
    JWT_MIDDLEWARE = 'JWT Middleware',
    ROLE_MIDDLEWARE = 'Role Middleware',
    AUTH = 'Auth',
    USERS = 'Users',
    KATAS = 'Katas'
}

export enum ErrorTypes {
    SOMETHING_WRONG = 'Something Wrong',
    MISSING_PERMISSIONS = 'Missing Permissions',
    MISSING_DATA = 'Missing Data',
    BAD_DATA = 'Bad Data',
    MODEL_NOT_FOUND = 'Model Not Found'
}

/* ERROR CLASSES */

export class BaseError extends Error {
    public readonly provider: ErrorProviders;
    public readonly type: ErrorTypes;
    public readonly name: string;
    public readonly statusCode: StatusCodes;

    
    constructor(provider: ErrorProviders, type: ErrorTypes, statusCode: StatusCodes, message: string) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);

        this.provider = provider;
        this.type = type;
        this.statusCode = statusCode;
        this.name = `${this.provider}: ${this.type}`;

        Error.captureStackTrace(this);
    }

    public logError(): void {
        LogError(`[ERROR ${this.name}]: ${this.message}`);
    }

    public getResponse(): ErrorResponse {
        return {
            code: this.statusCode,
            error: this.name,
            message: this.message
        };
    }
};

/* SOMETHING WRONG */

export class SomethingWrongError extends BaseError {
    constructor(provider: ErrorProviders) {
        const type = ErrorTypes.SOMETHING_WRONG;
        const httpCode = StatusCodes.INTERNAL_SERVER_ERROR;
        const message = 'Something went wrong, try again';
        super(provider, type, httpCode, message);
    }
}

/* MISSING PERMISSIONS ERRORS */

export class MissingPermissionsError extends BaseError {
    constructor(provider: ErrorProviders, message: string) {
        const type = ErrorTypes.MISSING_PERMISSIONS;
        const httpCode = StatusCodes.FORBIDDEN;
        super(provider, type, httpCode, message);
    }
}

export class MissingRoleError extends MissingPermissionsError {
    constructor(message: string) {
        const provider = ErrorProviders.ROLE_MIDDLEWARE;
        super(provider, message);
    }
}

/* MISSING DATA ERRORS */

class MissingDataError extends BaseError {
    constructor(provider: ErrorProviders, httpCode: StatusCodes, message: string) {
        const type = ErrorTypes.MISSING_DATA;
        super(provider, type, httpCode, message);
    }
}

export class MissingTokenError extends MissingDataError {
    constructor(message: string) {
        const provider = ErrorProviders.JWT_MIDDLEWARE;
        const httpCode = StatusCodes.UNAUTHORIZED;
        super(provider, httpCode, message);
    }
}

/* export class MissingQueryError extends MissingDataError {
    constructor(provider: ErrorProviders, message: string) {
        const httpCode = StatusCodes.BAD_REQUEST;
        super(provider, httpCode, message);
    }
} */

/* BAD DATA ERRORS */

class BadDataError extends BaseError {
    constructor(provider: ErrorProviders, httpCode: StatusCodes, message: string) {
        const type = ErrorTypes.BAD_DATA;
        super(provider, type, httpCode, message);
    }
}

export class BadTokenError extends BadDataError {
    constructor(message: string) {
        const provider = ErrorProviders.JWT_MIDDLEWARE;
        const httpCode = StatusCodes.UNAUTHORIZED;
        super(provider, httpCode, message);
    }
}

export class BadQueryError extends BadDataError {
    constructor(provider: ErrorProviders, message: string) {
        const httpCode = StatusCodes.BAD_REQUEST;
        super(provider, httpCode, message);
    }
}

/* NOT FOUND ERRORS */

export class ModelNotFoundError extends BaseError {
    constructor(provider: ErrorProviders, message: string) {
        const type = ErrorTypes.MODEL_NOT_FOUND;
        const httpCode = StatusCodes.NOT_FOUND;
        super(provider, type, httpCode, message);
    }
}
