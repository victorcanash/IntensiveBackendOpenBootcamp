import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

import { verifyToken } from '../middlewares/verifyToken.middleware';
import { KatasController } from '../controllers/KatasController';
import { KataLevels, IKataUpdate, IKataStars } from '../domain/interfaces/IKata.interface';
import { fixKataLevelValue, fixNumberValue } from '../utils/valuesFixer';
import { BaseError, BadQueryError, ErrorProviders } from '../errors';
import { katasUpload, getKatasMulterError } from '../config/multer.config';


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
        const solution: string = req?.body?.solution || '';

        if (id && name && description && 
            level && intents && solution) {
            const fixedIntents = fixNumberValue(intents, 1, 1000, true);
            const fixedLevel: any = level ? fixKataLevelValue(level) : level;

            const kata: IKataUpdate = {
                name: name,
                description: description,
                level: fixedLevel,
                intents: fixedIntents,
                solution: solution,
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
        const solution: string = req?.body?.solution || '';

        if (name && description && level && 
            intents && solution) {
            const fixedIntents = fixNumberValue(intents, 1, 1000, true);
            const fixedLevel: any = level ? fixKataLevelValue(level) : level;

            const kata: IKataUpdate = {
                name: name,
                description: description,
                level: fixedLevel,
                intents: fixedIntents,
                solution: solution
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

katasRouter.route('/upload')
    .post(verifyToken, async (req: Request, res: Response) => {
        katasUpload(req, res, async (err: any) => {
            const multerError: BaseError | undefined = getKatasMulterError(req, err);
            if (multerError) {
                multerError.logError();
                return res.status(multerError.statusCode).send(multerError.getResponse());
            }

            const files: any = req.files;
            
            const controllerRes = await controller.updateKataFiles(files);

            return res.status(controllerRes?.code).send(controllerRes);
            
        });
    });

export default katasRouter;
