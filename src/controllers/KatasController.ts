import { Delete, Get, Post, Put, Query, Route, Tags, Body } from 'tsoa';

import { LogSuccess, /* LogError, */ LogWarning } from '../utils/logger';
import { IKatasController } from './interfaces';
import { getAllKatas, getKataByID, updateKataByID, deleteKataByID, createKata } from '../domain/orm/Katas.orm';
import { IKata, KataLevel } from '../domain/interfaces/IKata.interface';


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
    public async deleteKata(@Query()id?: string): Promise<any> {
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/katas] Delete Kata By ID: ${id} `);
            await deleteKataByID(id).then((r) => {
                response = {
                    message: `Kata with id ${id} deleted successfully`
                };
            });
        } else {
            LogWarning('[/api/katas] Delete Kata Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to remove from database'
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
    public async updateKata(@Body()kata: IKata, @Query()id?: string): Promise<any> { 
        let response: any = '';
        
        if (id) {
            LogSuccess(`[/api/katas] Update Kata By ID: ${id} `);
            await updateKataByID(kata, id).then((r) => {
                response = {
                    message: `Kata with id ${id} updated successfully`
                };
            });
        } else {
            LogWarning('[/api/katas] Update Kata Request WITHOUT ID');
            response = {
                message: 'Please, provide an ID to update an existing user'
            };
        }
        
        return response;
    }
}
