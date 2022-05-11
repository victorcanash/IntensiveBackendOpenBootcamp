import S3, { PutObjectRequest, GetObjectRequest, DeleteObjectsRequest } from 'aws-sdk/clients/s3';
import fs from 'fs';

import { envConfig } from '../config/env.config';
import { ErrorProviders, SomethingWrongError } from '../errors';
// import { LogError } from './logger';


const bucketName = envConfig.AWS_BUCKET_NAME;

const s3 = new S3();

// eslint-disable-next-line no-undef
const uploadFilesS3 = async (files: Express.Multer.File[], _errorProvider: ErrorProviders) => {
    // const errorProvider = _errorProvider;
    files.forEach(async (file) => {
        const fileContent = fs.readFileSync(file.path);
        const params: PutObjectRequest = {
            Bucket: bucketName,
            Body: fileContent,
            Key: file.filename,
        };

        await s3.upload(params).promise().then((data) => {
            console.log('DataUpload: ', data);
        }).catch((err) => {
            console.log('ErrorUpload: ', err);
            // LogError(err.message);
            // const error = new SomethingWrongError(errorProvider);
            // error.logError();
        });
    });
};

export const existsFileS3 = async (filename: string) => {
    const params: GetObjectRequest = {
        Bucket: bucketName,
        Key: filename,
    };

    let exists: boolean = false;

    await s3.headObject(params).promise().then((data) => {
        console.log('DataExists: ', data);
        exists = true;
    }).catch((err) => {
        console.log('ErrorExists:', err);
    });

    return exists;
};

export const getFileStreamS3 = async (filename: string) => {
    const downloadParams: GetObjectRequest = {
        Bucket: bucketName,
        Key: filename,
    };
    const result = await s3.getObject(downloadParams).createReadStream();
    return result;
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
export const uploadKataFilesS3 = async (files: Express.Multer.File[]) => {
    await uploadFilesS3(files, ErrorProviders.KATAS);
};

export const deleteKataFilesS3 = async (filenames: string[]) => {
    await deleteFilesS3(filenames, ErrorProviders.KATAS);
};
