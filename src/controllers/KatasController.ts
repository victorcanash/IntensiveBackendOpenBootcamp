import { Delete, Get, Post, Put, Query, Route, Tags, Body } from 'tsoa';

import { LogSuccess, /* LogError, */ LogWarning } from '../utils/logger';
import { IKatasController } from './interfaces';
import { getAllKatas, getKataByID, updateKataByID, deleteKataByID, createKata, getKataFromUser } from '../domain/orm/Katas.orm';
import { IKata, IUpdateKata, KataLevel } from '../domain/interfaces/IKata.interface';


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
     * @param {IKata} kata Kata interface to create
     * @returns message informing if creating was correct
     */
    @Post('/')
    public async createKata(@Body()kata: IKata): Promise<any> {
        let response: any = '';

        LogSuccess(`[/api/katas] Create New Kata: ${kata.name} `);
        await createKata(kata).then((r) => {
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
     * @param {string} id Id of Kata to update
     * @param {IKata} kata Kata interface to update
     * @returns message informing if updating was correct
     */
    @Put('/')
    public async updateKata(@Body()kata: IUpdateKata, @Query()id?: string, @Query()userId?: string): Promise<any> { 
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
                                LogSuccess(`[/api/katas] Update Kata By ID: ${id} `);
                                response = {
                                    message: `Kata with id ${id} updated successfully`
                                };
                            });
                    }
                });

        } else if (!id) {
            LogWarning('[/api/katas] Update Kata Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to update an existing user'
            };

        } else if (!userId) {
            LogWarning('[/api/katas] Update Kata Request WITHOUT userID');
            response = {
                message: 'Please, provide an userID to update an existing user'
            };
        }
        
        return response;
    }
}
