import { Request } from 'express';
import multer from 'multer';

import { BadQueryError, ErrorProviders } from '../errors';


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
    fileSize: 200000000 // bytes(B)
};

// eslint-disable-next-line no-undef
const katasFileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    if (!katasAllowedMimes.includes(file.mimetype)) {
        cb(new BadQueryError(ErrorProviders.KATAS, `Invalid file type. Only ${katasAllowedMimes} types are allowed.`));
    }
    cb(null, true);
};

const katasMulter = multer({ 
    storage: katasStorage,
    fileFilter: katasFileFilter,
    limits: katasFileLimits,
    preservePath: false
});

export const katasMulterFieldName = 'file';
export const katasMulterSingle = katasMulter.single(katasMulterFieldName);
