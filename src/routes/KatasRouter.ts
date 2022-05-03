import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';

import { verifyToken } from '../middlewares/verifyToken.middleware';
import { KatasController } from '../controllers/KatasController';
import { KataLevels, IKataUpdate, IKataStars } from '../domain/interfaces/IKata.interface';
import { fixKataLevelValue, fixNumberValue } from '../utils/valuesFixer';
import { BadQueryError, SomethingWrongError, ErrorProviders } from '../errors';


const jsonParser = bodyParser.json();

const multerUpload = multer({ dest: 'uploads/' });
const multerFieldName = 'file';
const multerSingle = multerUpload.single(multerFieldName);

const katasRouter = express.Router();

const controller: KatasController = new KatasController();

katasRouter.route('/')
    .get(verifyToken, async (req: Request, res: Response) => {
        const page: any = req?.query?.page || 1;
        const limit: any = req?.query?.limit || 10;
        const id: any = req?.query?.id;
        const level: any = req?.query?.level;
        const order: any = req?.query?.order || '{}';

        const fixedLevel: any = level ? fixKataLevelValue(level) : level;
        const fixedOrder: {} = JSON.parse(order);

        const controllerRes: any = await controller.getKatas(page, limit, fixedOrder, id, fixedLevel);

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
        multerSingle(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                const errorMessage = `${err.message}. The field name must be called ${multerFieldName} and must contain a single file`;
                const badQueryError = new BadQueryError(ErrorProviders.KATAS, errorMessage);
                badQueryError.logError();
                return res.status(badQueryError.statusCode).send(badQueryError.getResponse());

            } else if (err) {
                const somethingWrongError = new SomethingWrongError(ErrorProviders.KATAS);
                somethingWrongError.logError();
                return res.status(somethingWrongError.statusCode).send(somethingWrongError.getResponse());
            }
        
            // eslint-disable-next-line no-undef
            const file: Express.Multer.File | undefined = req.file;
            if (!file) {
                const badQueryError = new BadQueryError(ErrorProviders.KATAS, 'File field not found');
                badQueryError.logError();
                return res.status(badQueryError.statusCode).send(badQueryError.getResponse());
                
            } else {
                const controllerRes = await controller.updateKataFile(file);

                return res.status(controllerRes.code).send(controllerRes);
            }
        });
    });

export default katasRouter;
