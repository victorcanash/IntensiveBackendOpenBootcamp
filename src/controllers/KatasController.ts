import { Delete, Get, Post, Put, Query, Route, Tags, Body } from 'tsoa';

import { LogSuccess, /* LogError, */ LogWarning } from '../utils/logger';
import { IKatasController } from './interfaces';
import { getAllKatas, getKataByID, updateKataByID, updateKataStarsByID, updateKataParticipantsByID, deleteKataByID, createKata, getKataFromUser } from '../domain/orm/Katas.orm';
import { IKata, IKataUpdate, IKataStars, KataLevel } from '../domain/interfaces/IKata.interface';


@Route('/api/katas')
@Tags('KatasController')
export class KatasController implements IKatasController {

    /**
     * Endpoint to retreive the katas in the Collection "Katas" of DB 
     * @param {string} id Id of Kata to retreive (optional)
     * @returns All katas o kata found by ID
     */
    @Get('/')
    public async getKatas(@Query()page: number, @Query()limit: number, @Query()order: any, @Query()id?: string, @Query()level?: KataLevel): Promise<any> { 
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/katas] Get Kata By ID: ${id}`);
            response = await getKataByID(id);
        } else {
            LogSuccess('[/api/katas] Get All Katas Request');
            response = await getAllKatas(page, limit, order, level);
        }
        
        return response;
    }

    /**
     * Endpoint to create a Kata in the Collection "Katas" of DB 
     * @param {IKataUpdate} kata Kata interface to create
     * @returns message informing if creating was correct
     */
    @Post('/')
    public async createKata(@Body()kata: IKataUpdate, userId: string): Promise<any> {
        let response: any = '';

        const newKata: IKata = {
            name: kata.name,
            description: kata.description,
            level: kata.level,
            intents: kata.intents,
            stars: {
                average: 0,
                users: []
            },
            creator: userId,
            solution: kata.solution,
            participants: []
        };

        LogSuccess(`[/api/katas] Create New Kata: ${kata.name} `);
        await createKata(newKata).then((r) => {
            LogSuccess(`[/api/katas] Created Kata: ${kata.name} `);
            response = {
                message: `Kata created successfully: ${kata.name}`
            };
        });

        return response;
    }

    /**
     * Endpoint to delete the Katas in the Collection "Katas" of DB 
     * @param {string} id Id of Kata to delete (optional)
     * @returns message informing if deletion was correct
     */
    @Delete('/')
    public async deleteKata(@Query()id?: string, @Query()userId?: string): Promise<any> {
        let response: any = '';
        
        if (id && userId) {
            // Check if Kata is from logged user
            await getKataFromUser(id, userId)
                .then(async (kataFromUser) => {
                    if (!kataFromUser) {
                        LogWarning(`[/api/katas] Delete Kata Request, kata with id ${id} is not from user with id ${userId}`);
                        response = {
                            message: `Kata with id ${id} is not from user with id ${userId}`
                        };
                    } else {
                        // Delete kata
                        await deleteKataByID(id)
                            .then((r) => {
                                LogSuccess(`[/api/katas] Delete Kata By ID: ${id} `);
                                response = {
                                    message: `Kata with id ${id} deleted successfully`
                                };
                            });
                    }
                });

        } else if (!id) {
            LogWarning('[/api/katas] Delete Kata Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to remove from database'
            };

        } else if (!userId) {
            LogWarning('[/api/katas] Delete Kata Request WITHOUT userID');
            response = {
                message: 'Please, provide an userID to remove from database'
            };
        }
        
        return response;
    }

    /**
     * Endpoint to update a Kata in the Collection "Katas" of DB 
     * @param {IKataUpdate} kata Kata interface to update
     * @param {string} id Id of Kata to update
     * @param {string} userId Id of logged user to update
     * @returns message informing if updating was correct
     */
    @Put('/')
    public async updateKata(@Body()kata: IKataUpdate, @Query()id?: string, @Query()userId?: string): Promise<any> { 
        let response: any = '';
        
        if (id && userId) {
            // Check if Kata is from logged user
            await getKataFromUser(id, userId)
                .then(async (kataFromUser) => {
                    if (!kataFromUser) {
                        LogWarning(`[/api/katas] Update Kata Request, kata with id ${id} is not from user with id ${userId}`);
                        response = {
                            message: `Kata with id ${id} is not from user with id ${userId}`
                        };
                    } else {
                        // Update kata
                        await updateKataByID(kata, id)
                            .then((r) => {
                                LogSuccess(`[/api/katas] Update Kata By ID: ${id}`);
                                response = {
                                    message: `Kata with id ${id} updated successfully`
                                };
                            });
                    }
                });

        } else if (!id) {
            LogWarning('[/api/katas] Update Kata Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to update an existing kata'
            };

        } else if (!userId) {
            LogWarning('[/api/katas] Update Kata Request WITHOUT userID');
            response = {
                message: 'Please, provide an userID to update an existing kata'
            };
        }
        
        return response;
    }

    /**
     * Endpoint to update stars of a Kata in the Collection "Katas" of DB 
     * @param {IKataStars} kataStars Kata stars interface to update
     * @param {string} id Id of Kata to update stars
     * @returns message informing if updating was correct
     */
     @Put('/stars')
    public async updateKataStars(@Body()kataStars: IKataStars, @Query()id?: string): Promise<any> {
        let response: any = '';
        
        if (id) {
            // Update kata
            await updateKataStarsByID(kataStars, id)
                .then((r) => {
                    LogSuccess(`[/api/katas/stars] Update Kata Stars By ID: ${id}`);
                    response = {
                        message: `Kata Stars with id ${id} updated successfully`
                    };
                });

        } else {
            LogWarning('[/api/katas/stars] Update Kata Stars Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to update stars of an existing kata'
            };
        }

        return response;
    }

    /**
     * Endpoint to send a Kata solution in the Collection "Katas" of DB 
     * @param {string} solution Kata solution of user to check if it is correct
     * @param {string} id Id of Kata to check
     * @param {string} userId Id of logged user to update participants list
     * @returns message informing if checking was correct
     */
    @Put('/resolve')
    public async sendKataSolution(@Body()solution: string, @Query()id?: string, @Query()userId?: string): Promise<any> { 
        let response: any = '';
        
        if (id && userId) {
            // Update kata participants
            await updateKataParticipantsByID(id, userId)
                .then((kata) => {
                    LogSuccess(`[/api/katas/solution] Check Kata Solution: ${solution} By ID: ${id}`);
                    // Check kata solution
                    response = {
                        solution: kata.solution,
                        message: '',
                    };
                    if (kata.solution === solution) {
                        response.message = `Kata Solution with id ${id} checked successfully, CORRECT solution`;
                    } else {
                        response.message = `Kata Solution with id ${id} checked successfully, WRONG solution`;
                    }
                });

        } else if (!id) {
            LogWarning('[/api/katas/resolve] Check Kata Solution Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to check a kata solution'
            };

        } else if (!userId) {
            LogWarning('[/api/katas] Check Kata Solution Request WITHOUT userID');
            response = {
                message: 'Please, provide an userID to check a kata solution'
            };
        }
        
        return response;
    }
}
