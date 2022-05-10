import S3, { PutObjectRequest, GetObjectRequest, DeleteObjectsRequest } from 'aws-sdk/clients/s3';
import fs from 'fs';

import { envConfig } from '../config/env.config';
import { ErrorProviders, SomethingWrongError } from '../errors';


const bucketName = envConfig.AWS_BUCKET_NAME;

const s3 = new S3();

// eslint-disable-next-line no-undef
const uploadFilesS3 = (files: Express.Multer.File[], _errorProvider: ErrorProviders) => {
    const errorProvider = _errorProvider;

    files.forEach(async (file) => {
        const fileContent = fs.readFileSync(file.path);
        const uploadParams: PutObjectRequest = {
            Bucket: bucketName,
            Body: fileContent,
            Key: file.filename,
        };

        await s3.upload(uploadParams).promise().catch(() => {
            const error = new SomethingWrongError(errorProvider);
            error.logError();
        });
    });
};

export const existsFileS3 = async (filename: string) => {
    const searchParams: GetObjectRequest = {
        Bucket: bucketName,
        Key: filename,
    };
    let exists: boolean = false;
    await s3.headObject(searchParams).promise().then(
        () => {
            exists = true;
        }, 
        (error) => {
            if (error.statusCode) {
                exists = false;
            }
        }
    );
    return exists;
};

export const getFileStreamS3 = (filename: string) => {
    const downloadParams: GetObjectRequest = {
        Bucket: bucketName,
        Key: filename,
    };
    return s3.getObject(downloadParams).createReadStream();
};

const deleteFilesS3 = async (filenames: string[], _errorProvider: ErrorProviders) => {
    const errorProvider = _errorProvider;

    const objects: { Key: string }[] = [];
    filenames.forEach((filename: string) => {
        objects.push({ Key: filename });
    });

    const deleteParams: DeleteObjectsRequest = {
        Bucket: bucketName,
        Delete: {
            Objects: objects
        }
    };
    await s3.deleteObjects(deleteParams).promise().catch(() => {
        const error = new SomethingWrongError(errorProvider);
        error.logError();
    });
};

// eslint-disable-next-line no-undef
export const uploadKataFilesS3 = (files: Express.Multer.File[]) => {
    uploadFilesS3(files, ErrorProviders.KATAS);
};

export const deleteKataFilesS3 = (filenames: string[]) => {
    deleteFilesS3(filenames, ErrorProviders.KATAS);
};
