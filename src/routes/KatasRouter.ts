import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { StatusCodes } from 'http-status-codes';

import { verifyToken } from '../middlewares/verifyToken.middleware';
import { KatasController } from '../controllers/KatasController';
import { KataLevels, IKataUpdate, IKataStars } from '../domain/interfaces/IKata.interface';
import { fixKataLevelValue, fixNumberValue } from '../utils/valuesFixer';
import { BaseError, BadQueryError, SomethingWrongError, ErrorProviders } from '../errors';
import { getKatasMulterHandler, getKatasMulterError } from '../utils/multerUploader';


const jsonParser = bodyParser.json();

const katasRouter = express.Router();

const controller: KatasController = new KatasController();

katasRouter.route('/')
    .get(verifyToken, async (req: Request, res: Response) => {
        const page: any = req?.query?.page;
        const limit: any = req?.query?.limit;
        const id: any = req?.query?.id;
        const level: any = req?.query?.level;
        const order: any = req?.query?.order;

        const fixedLevel: any = level ? fixKataLevelValue(level) : level;

        const controllerRes: any = await controller.getKatas(page, limit, order, id, fixedLevel);

        return res.status(controllerRes.code).send(controllerRes);
    })

    .delete(verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;

        if (id) {
            const controllerRes: any = await controller.deleteKata(id);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata can be deleted');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    })

    .put(jsonParser, verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;
        
        const name: string = req?.body?.name;
        const description: string = req?.body?.description || '';
        const level: any = req?.body?.level || KataLevels.BASIC;
        const intents: number = req?.body?.intents || 1;

        if (id && name && description && 
            level && intents) {
            const fixedIntents = fixNumberValue(intents, 1, 1000, true);
            const fixedLevel: any = level ? fixKataLevelValue(level) : level;

            const kata: IKataUpdate = {
                name: name,
                description: description,
                level: fixedLevel,
                intents: fixedIntents
            };

            const controllerRes = await controller.updateKata(kata, id);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata can be updated');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    })

    .post(jsonParser, verifyToken, async (req: Request, res: Response) => {
        const name: string = req?.body?.name;
        const description: string = req?.body?.description || '';
        const level: any = req?.body?.level || KataLevels.BASIC;
        const intents: number = req?.body?.intents || 1;

        if (name && description && level && 
            intents) {
            const fixedIntents = fixNumberValue(intents, 1, 1000, true);
            const fixedLevel: any = level ? fixKataLevelValue(level) : level;

            const kata: IKataUpdate = {
                name: name,
                description: description,
                level: fixedLevel,
                intents: fixedIntents
            };

            const controllerRes = await controller.createKata(kata);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata can be created');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

katasRouter.route('/stars')
    .put(jsonParser, verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;
        
        const stars: number = req?.body?.stars;

        if (id && stars) {
            const fixedStars = fixNumberValue(stars, 0, 5, true);

            const kataStars: IKataStars = {
                user: '',
                stars: fixedStars
            };

            const controllerRes: any = await controller.updateKataStars(kataStars, id);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata stars can be updated');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

katasRouter.route('/resolve')
    .put(jsonParser, verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;
        
        const solution: string = req?.body?.solution;

        if (id && solution) {
            const controllerRes: any = await controller.sendKataSolution(solution, id);

            return res.status(controllerRes.code).send(controllerRes);

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata solution can be sent');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

katasRouter.route('/files')
    .get(verifyToken, async (req: Request, res: Response) => {
        const filename: any = req?.query?.filename;

        if (filename) {
            const controllerRes: any = await controller.getKataFile(filename);
            if (controllerRes?.code === StatusCodes.OK && controllerRes?.readable) {
                controllerRes.readable.pipe(res);

            } else {
                const somethingError = new SomethingWrongError(ErrorProviders.KATAS);
                somethingError.logError();
                return res.status(somethingError.statusCode).send(somethingError.getResponse());
            }
            
        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata file can be obtained, missing filename');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    })

    .put(verifyToken, async (req: Request, res: Response) => {
        const id: any = req?.query?.id;

        if (id) {
            const uploadMulter = getKatasMulterHandler();
            uploadMulter(req, res, async (err: any) => {
                const multerError: BaseError | undefined = getKatasMulterError(req, err);
                if (multerError) {
                    multerError.logError();
                    return res.status(multerError.statusCode).send(multerError.getResponse());
                }

                const files: any = req.files;
                
                const controllerRes = await controller.updateKataFiles(files, id);

                return res.status(controllerRes?.code).send(controllerRes);   
            });

        } else {
            const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'No kata files can be uploaded');
            badQueryError.logError();
            return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
        }
    });

export default katasRouter;
