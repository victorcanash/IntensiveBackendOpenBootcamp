import express, { Request, Response } from 'express';
// Body Parser to read BODY from requests
import bodyParser from 'body-parser';
// JWT Verifier MiddleWare
import { verifyToken } from '../middlewares/verifyToken.middleware';

import { KatasController } from '../controllers/KatasController';
// import { LogInfo } from '../utils/logger';
import { KataLevel, IKata } from '../domain/interfaces/IKata.interface';


const jsonParser = bodyParser.json();

// Router from express
const katasRouter = express.Router();


// http://localhost:8000/api/katas
katasRouter.route('/')
    // GET:
    .get(verifyToken, async (req: Request, res: Response) => {
        // Obtain Query Params
        const page: any = req?.query?.page || 1;
        const limit: any = req?.query?.limit || 10;
        const mostRecent: any = req?.query?.mostRecent || 0;
        const id: any = req?.query?.id;
        let level: any = req?.query?.level;
        if (level) {
            if (level.toUpperCase().includes('BASIC')) {
                level = KataLevel.BASIC;
            } else if (level.toUpperCase().includes('MEDIUM')) {
                level = KataLevel.MEDIUM;
            } else if (level.toUpperCase().includes('HIGH')) {
                level = KataLevel.HIGH;
            }
        }

        // Controller Instance to excute method
        const controller: KatasController = new KatasController();
        // Obtain Reponse
        const response: any = await controller.getKatas(page, limit, !!parseInt(mostRecent), id, level);
        // Send to the client the response
        return res.status(200).send(response);
    })
    // DELETE:
    .delete(verifyToken, async (req: Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;
        // Controller Instance to excute method
        const controller: KatasController = new KatasController();
        // Obtain Reponse
        const response: any = await controller.deleteKata(id);
        // Send to the client the response
        return res.status(200).send(response);
    })
    // PUT:
    .put(jsonParser, verifyToken, async (req: Request, res: Response) => {
        // Obtain a Query Param (ID)
        const id: any = req?.query?.id;
        
        // Read from body
        const name: string = req?.body?.name;
        const description: string = req?.body?.description || '';
        let level: any = req?.body?.level || KataLevel.BASIC;
        if (level) {
            if (level.toUpperCase().includes('BASIC')) {
                level = KataLevel.BASIC;
            } else if (level.toUpperCase().includes('MEDIUM')) {
                level = KataLevel.MEDIUM;
            } else if (level.toUpperCase().includes('HIGH')) {
                level = KataLevel.HIGH;
            }
        }
        const intents: number = req?.body?.intents || 0;
        const stars: number = req?.body?.starts || 0;
        const creator: string = req?.body?.creator;
        const solution: string = req?.body?.solution || '';
        const participants: string[] = req?.body?.participants || [];

        if (name && description && level && intents >= 0 && stars >= 0 && creator && solution && participants.length >= 0) {
            // Controller Instance to excute method
            const controller: KatasController = new KatasController();

            const kata: IKata = {
                name: name,
                description: description,
                level: level,
                intents: intents,
                stars: stars,
                creator: creator,
                solution: solution,
                participants: participants
            };

            // Obtain Response
            const response: any = await controller.updateKata(id, kata);

            // Send to the client the response
            return res.status(200).send(response);
        } else {
            return res.status(400).send({
                message: '[ERROR] Updating Kata. You need to send all attributes of Kata to update it'
            });
        }
    })
    .post(jsonParser, verifyToken, async (req: Request, res: Response) => {
        // Read from body
        const name: string = req?.body?.name;
        const description: string = req?.body?.description || 'Default description';
        let level: any = req?.body?.level || KataLevel.BASIC;
        if (level) {
            if (level.toUpperCase().includes('BASIC')) {
                level = KataLevel.BASIC;
            } else if (level.toUpperCase().includes('MEDIUM')) {
                level = KataLevel.MEDIUM;
            } else if (level.toUpperCase().includes('HIGH')) {
                level = KataLevel.HIGH;
            }
        }
        const intents: number = req?.body?.intents || 0;
        const stars: number = req?.body?.stars || 0;
        const creator: string = req?.body?.creator;
        const solution: string = req?.body?.solution || 'Default Solution';
        const participants: string[] = req?.body?.participants || [];

        if (name && description && level && intents >= 0 && stars >= 0 && creator && solution && participants.length >= 0) {
            // Controller Instance to excute method
            const controller: KatasController = new KatasController();

            const kata: IKata = {
                name: name,
                description: description,
                level: level,
                intents: intents,
                stars: stars,
                creator: creator,
                solution: solution,
                participants: participants
            };

            // Obtain Response
            const response: any = await controller.createKata(kata);

            // Send to the client the response
            return res.status(201).send(response);
        } else {
            return res.status(400).send({
                message: '[ERROR] Creating Kata. You need to send all attrs of Kata to update it'
            });
        }
});

// Export Users Router
export default katasRouter;

/**
 * 
 * Get Documents => 200 OK
 * Creation Documents => 201 OK
 * Deletion of Documents => 200 (Entity) / 204 (No return)
 * Update of Documents =>  200 (Entity) / 204 (No return)
 * 
 */
