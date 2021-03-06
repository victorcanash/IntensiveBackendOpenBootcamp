import { Delete, Get, Post, Put, Query, Route, Tags, Body, Security, Response, SuccessResponse, UploadedFiles } from 'tsoa';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs';
import * as util from 'util';

import { IKatasController } from './interfaces';
import { ErrorResponse, BasicResponse, KataFilesResponse, KataResponse, KatasResponse, ReadableResponse } from './types';
import server from '../server';
import { SomethingWrongError, MissingPermissionsError, BaseError, ErrorProviders, ErrorTypes, BadQueryError } from '../errors';
import { LogSuccess } from '../utils/logger';
import { getAllKatas, getKataByID, updateKataByID, updateKataStarsByID, updateKataFilesByID, updateKataParticipantsByID, deleteKataByID, createKata, existsKataParticipant } from '../domain/orm/Katas.orm';
import { getUserByEmail, addUserKataByEmail, deleteUserKataByEmail, isKataFromUser } from '../domain/orm/Users.orm';
import { IKata, IKataUpdate, IKataStars, KataLevels } from '../domain/interfaces/IKata.interface';
import { IUser, UserRoles } from '../domain/interfaces/IUser.interface';
import { KatasResponse as KatasORMResponse } from '../domain/types';
import { uploadKataFilesS3, getFileStreamS3, existsFileS3 } from '../utils/s3';


@Route('/api/katas')
@Tags('KatasController')
export class KatasController implements IKatasController {
    private readonly somethingWrongError = new SomethingWrongError(ErrorProviders.KATAS);

    
    @Get('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async getKata(@Query()id: string): Promise<KataResponse | ErrorResponse> { 
        let response: KataResponse | ErrorResponse = this.somethingWrongError.getResponse();
        
        await getKataByID(id).then((foundKata: IKata) => {
            response = {
                code: StatusCodes.OK,
                message: 'Kata found successfully',
                kata: foundKata
            };
            LogSuccess(`[/api/katas] Get kata by ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @Get('/all')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async getKatas(@Query()page?: number, @Query()limit?: number, @Query()order?: any, @Query()level?: KataLevels): Promise<KatasResponse | ErrorResponse> { 
        let response: KatasResponse | ErrorResponse = this.somethingWrongError.getResponse();
        
        const fixedOrder = order ? JSON.parse(order) : {};

        await getAllKatas(page || 1, limit || 10, fixedOrder, level).then((katasResponse: KatasORMResponse) => {
            response = {
                code: StatusCodes.OK,
                message: 'Katas found successfully',
                katas: katasResponse.katas,
                totalPages: katasResponse.totalPages,
                currentPage: katasResponse.currentPage
            };
            LogSuccess('[/api/katas] Get all katas');

        }).catch((error: BaseError) => {
            response = error.getResponse();
        }); 
        
        return response;
    }

    @Post('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async createKata(@Body()kata: IKataUpdate): Promise<KataResponse | ErrorResponse> {
        let response: KataResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email: any = server.locals.payload?.email;

        const newKata: IKata = {
            name: kata.name,
            description: kata.description,
            level: kata.level,
            intents: kata.intents,
            stars: {
                average: 0,
                users: []
            },
            creator: '',
            participants: [],
            files: []
        };

        await getUserByEmail(email).then((foundUser: IUser | any) => {
            newKata.creator = foundUser!._id;

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        if (newKata.creator === '') {
            return response;
        }

        let id: string = '';

        await createKata(newKata).then((createdKata: IKata | any) => {
            id = createdKata!._id;
            response = {
                code: StatusCodes.CREATED,
                message: `Kata created successfully with ID: ${id}`,
                kata: createdKata
            };

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        if (id === '') {
            return response;
        }

        await addUserKataByEmail(id, email).then((updatedUser: IUser) => {
            LogSuccess(`[/api/kata] Created kata with ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        return response;
    }

    @Delete('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.FORBIDDEN, ErrorTypes.MISSING_PERMISSIONS)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async deleteKata(@Query()id: string): Promise<BasicResponse | ErrorResponse> {
        let response: BasicResponse | ErrorResponse = this.somethingWrongError.getResponse();
        
        const email: any = server.locals.payload?.email;
        const role: any = server.locals.payload?.role;

        if (role !== UserRoles.ADMIN) {
            let exists: boolean = false;

            await isKataFromUser(email, id).then((existsResult: boolean) => {
                exists = existsResult;
                if (!existsResult) {
                    throw new MissingPermissionsError(ErrorProviders.KATAS, `No kata can be deleted by ID: ${id}`);
                }
                
            }).catch((error: BaseError) => {
                error.logError();
                response = error.getResponse();
            });

            if (!exists) {
                return response;
            }
        }

        let deletedKata = {} as IKata;

        await deleteKataByID(id).then((kataResult: IKata) => {
            deletedKata = kataResult;
            response = {
                code: StatusCodes.OK,
                message: `Kata deleted successfully by ID: ${id}`
            };

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        if (!deletedKata) {
            return response;
        }

        await deleteUserKataByEmail(id, email).then((updatedUser: IUser) => {
            LogSuccess(`[/api/users] Deleted kata by ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @Put('/')
    @Security('jwt')
    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.FORBIDDEN, ErrorTypes.MISSING_PERMISSIONS)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async updateKata(@Body()kata: IKataUpdate, @Query()id: string): Promise<KataResponse | ErrorResponse> { 
        let response: KataResponse | ErrorResponse = this.somethingWrongError.getResponse();
        
        const email: any = server.locals.payload?.email;
        const role: any = server.locals.payload?.role;

        if (role !== UserRoles.ADMIN) {
            let exists: boolean = false;

            await isKataFromUser(email, id).then((existsResult: boolean) => {
                exists = existsResult;
                if (!exists) {
                    throw new MissingPermissionsError(ErrorProviders.KATAS, `No kata can be updated by id: ${id}`);
                }
                
            }).catch((error: BaseError) => {
                error.logError();
                response = error.getResponse();
            });

            if (!exists) {
                return response;
            }
        }

        await updateKataByID(kata, id).then((updatedKata: IKata) => {
            response = {
                code: StatusCodes.CREATED,
                message: `Kata updated successfully by ID: ${id}`,
                kata: updatedKata
            };
            LogSuccess(`[/api/katas] Update Kata by ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @Put('/stars')
    @Security('jwt')
    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.FORBIDDEN, ErrorTypes.MISSING_PERMISSIONS)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async updateKataStars(@Body()kataStars: IKataStars, @Query()id: string): Promise<KataResponse | ErrorResponse> {
        let response: KataResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email: any = server.locals.payload?.email;

        await getUserByEmail(email).then((userResult: IUser | any) => {
            kataStars.user = userResult!._id;
            
        }).catch((error: BaseError) => {
            error.logError();
            response = error.getResponse();
        });

        if (kataStars.user === '') {
            return response;
        }

        let exists: boolean = false;

        await existsKataParticipant(id, kataStars.user).then((existsResult: boolean) => {
            exists = existsResult;
            if (!exists) {
                throw new MissingPermissionsError(ErrorProviders.KATAS, `No kata stars can be updated by id: ${id}`);
            }
            
        }).catch((error: BaseError) => {
            error.logError();
            response = error.getResponse();
        });

        if (!exists) {
            return response;
        }

        await updateKataStarsByID(kataStars, id).then((updatedKata: IKata) => {
            response = {
                code: StatusCodes.CREATED,
                message: `Kata Stars updated successfully by ID: ${id}`,
                kata: updatedKata
            };
            LogSuccess(`[/api/katas/stars] Update Kata Stars by ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        return response;
    }

    @Get('/files')
    @Security('jwt')
    @SuccessResponse(StatusCodes.OK)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async getKataFile(@Query()filename: string): Promise<ReadableResponse | ErrorResponse> {
        let response: ReadableResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const exists: boolean = await existsFileS3(filename);

        if (exists) {
            const readStream = await getFileStreamS3(filename);
            response = {
                code: StatusCodes.OK,
                readable: readStream
            };
            LogSuccess(`[/api/katas/files] Get Kata File by filename: ${filename}`);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata file can be obtained, filename cannot be found');
            badQueryError.logError();
            response = badQueryError.getResponse();
        }

        return response;
    }

    @Put('/files')
    @Security('jwt')
    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.FORBIDDEN, ErrorTypes.MISSING_PERMISSIONS)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    // eslint-disable-next-line no-undef
    public async updateKataFiles(@UploadedFiles() files: Express.Multer.File[], @Query()id: string): Promise<KataFilesResponse | ErrorResponse> {
        let response: KataFilesResponse | ErrorResponse = this.somethingWrongError.getResponse();

        await uploadKataFilesS3(files);

        const unlinkFile = await util.promisify(fs.unlink);
        files.forEach(async (file: any) => {
            await unlinkFile(file.path);
        });
        
        const email: any = server.locals.payload?.email;
        const role: any = server.locals.payload?.role;

        if (role !== UserRoles.ADMIN) {
            let exists: boolean = false;

            await isKataFromUser(email, id).then((existsResult: boolean) => {
                exists = existsResult;
                if (!exists) {
                    throw new MissingPermissionsError(ErrorProviders.KATAS, `No kata files can be updated by id: ${id}`);
                }
                
            }).catch((error: BaseError) => {
                error.logError();
                response = error.getResponse();
            });

            if (!exists) {
                return response;
            }
        }

        const filenames: string[] = [];
        files.forEach((file) => {
            filenames.push(file.filename);
        });

        await updateKataFilesByID(id, filenames).then((updatedKata: IKata) => {
            const filesInfo = [] as {name: string, mimetype: string, size: string}[];
            files.forEach((file) => {
                filesInfo.push({
                    name: file.originalname,
                    mimetype: file.mimetype,
                    size: `${file.size} Bytes`
                });
            });
            response = {
                code: StatusCodes.CREATED,
                message: `Kata files was uploaded successfuly by ID: ${id}`,
                files: filesInfo,
                kata: updatedKata
            };
            LogSuccess(`[/api/katas/files] Update Kata Files by ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }

    @Put('/resolve')
    @Security('jwt')
    @SuccessResponse(StatusCodes.CREATED)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.MISSING_DATA)
    @Response<ErrorResponse>(StatusCodes.UNAUTHORIZED, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.BAD_REQUEST, ErrorTypes.BAD_DATA)
    @Response<ErrorResponse>(StatusCodes.NOT_FOUND, ErrorTypes.MODEL_NOT_FOUND)
    @Response<ErrorResponse>(StatusCodes.INTERNAL_SERVER_ERROR, ErrorTypes.SOMETHING_WRONG)
    public async sendKataSolution(@Body()solution: string, @Query()id: string): Promise<KataResponse | ErrorResponse> { 
        let response: KataResponse | ErrorResponse = this.somethingWrongError.getResponse();

        const email: any = server.locals.payload?.email;

        let participant: string = '';

        await getUserByEmail(email).then((foundUser: IUser | any) => {
            participant = foundUser!._id;
            
        }).catch((error: BaseError) => {
            response = error.getResponse();
        });

        if (participant === '') {
            return response;
        }

        await updateKataParticipantsByID(id, participant).then((updatedKata: IKata) => {
            response = {
                code: StatusCodes.CREATED,
                message: `Kata solution was sent successfuly by ID: ${id}`,
                kata: updatedKata
            };
            LogSuccess(`[/api/katas/solution] Send Kata Solution By ID: ${id}`);

        }).catch((error: BaseError) => {
            response = error.getResponse();
        });
        
        return response;
    }
}
