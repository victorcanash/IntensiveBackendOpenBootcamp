import { Request } from 'express';
import multer from 'multer';
import * as fs from 'fs';

import { BadQueryError, BaseError, ErrorProviders, SomethingWrongError } from '../errors';
import { katasMulterConfig } from '../config/multer.config';


const getUpload = (_config: any, _errorProvider: ErrorProviders) => {
    const config = _config;
    const errorProvider = _errorProvider;

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/' + config.destination);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    });

    // eslint-disable-next-line no-undef
    const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
        if (!config.allowedMimes.includes(file.mimetype)) {
            cb(new BadQueryError(errorProvider, `Invalid file type. Only ${config.allowedMimes} types are allowed.`));
        } else {
            cb(null, true);
        }
    };

    const newMulter = multer({ 
        storage: storage,
        fileFilter: fileFilter,
        limits: config.fileLimits,
        preservePath: config.preservePath
    });

    let newUpload = null;
    if (config.fileLimits.files > 1) {
        newUpload = newMulter.array(config.fieldName, config.fileLimits.files);
    } else {
        newUpload = newMulter.single(config.fieldName);
    }
    return newUpload;
};

const getUploadErrors = (_config: any, _errorProvider: ErrorProviders, req: Request, error: any) => {
    const config = _config;
    const errorProvider: ErrorProviders = _errorProvider;

    let multerError: BaseError | undefined = undefined;

    if (error instanceof multer.MulterError) {
        let errorMessage = '';
        if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = `${error.message}. Files can size at most ${config.fileLimits.fileSize} Bytes`;
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            errorMessage = `${error.message}. The field must contain at most ${config.fileLimits.files} files`;
        } else {
            errorMessage = `${error.message}. The field name must be called ${config.fieldName}`;
        }
        multerError = new BadQueryError(errorProvider, errorMessage);

    } else if (error instanceof BadQueryError) {
        multerError = error;

    } else if (error) {
        multerError = new SomethingWrongError(errorProvider);

    } else if (!req.files) {
        multerError = new BadQueryError(errorProvider, `There is no ${config.fieldName} field`);
    } else if (req.files.length < 1) {
        multerError = new BadQueryError(errorProvider, `${config.fieldName} field is empty`);
    }

    return multerError;
};

const deleteFiles = (errorProvider: ErrorProviders, path: string, filenames: string[]) => {
    try {
        filenames.forEach((filename) => {
            fs.unlinkSync(path + filename);
        });     
    } catch (error) {
        new SomethingWrongError(errorProvider).logError();
    }
};

export const getKatasUpload = () => {
    return getUpload(katasMulterConfig, ErrorProviders.KATAS);
};

export const getKatasUploadErrors = (req: Request, error: any) => {
    return getUploadErrors(katasMulterConfig, ErrorProviders.KATAS, req, error);
};

export const deleteKataFiles = (filenames: string[]) => {
    const path: string = 'public/' + katasMulterConfig.destination;
    deleteFiles(ErrorProviders.KATAS, path, filenames);
};
