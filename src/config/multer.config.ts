import { Request } from 'express';
import multer from 'multer';

import { BadQueryError, BaseError, ErrorProviders, SomethingWrongError } from '../errors';


const katasStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/katas');
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
      }
});

const katasAllowedMimes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png',
    'video/mp4',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'application/x-rar-compressed', // rar
    'application/zip', 'application/octet-stream', 'application/x-zip-compressed', 'multipart/x-zip', // zip
    'application/octet-stream' // rar and zip
];

export const katasFileLimits = {
    fileSize: 209715200, // bytes(B)
    files: 3
};

// eslint-disable-next-line no-undef
const katasFileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if (!katasAllowedMimes.includes(file.mimetype)) {
        cb(new BadQueryError(ErrorProviders.KATAS, `Invalid file type. Only ${katasAllowedMimes} types are allowed.`));
    } else {
        cb(null, true);
    }
};

const katasMulter = multer({ 
    storage: katasStorage,
    fileFilter: katasFileFilter,
    limits: katasFileLimits,
    preservePath: false
});

export const katasMulterFieldName = 'files';
export const katasUpload = katasMulter.array(katasMulterFieldName, 3);

export const getKatasMulterError = (req: Request, error: any) => {
    let multerError: BaseError | undefined = undefined;

    if (error instanceof multer.MulterError) {
        let errorMessage = '';
        if (error.code === 'LIMIT_FILE_SIZE') {
            errorMessage = `${error.message}. Files can size at most ${katasFileLimits.fileSize} Bytes`;
        } else if (error.code === 'LIMIT_FILE_COUNT') {
            errorMessage = `${error.message}. The field must contain at most ${katasFileLimits.files} files`;
        } else {
            errorMessage = `${error.message}. The field name must be called ${katasMulterFieldName}`;
        }
        multerError = new BadQueryError(ErrorProviders.KATAS, errorMessage);

    } else if (error instanceof BadQueryError) {
        multerError = error;

    } else if (error) {
        multerError = new SomethingWrongError(ErrorProviders.KATAS);

    } else if (!req.files) {
        multerError = new BadQueryError(ErrorProviders.KATAS, `${katasMulterFieldName} field is empty`);
    }

    return multerError;
};
