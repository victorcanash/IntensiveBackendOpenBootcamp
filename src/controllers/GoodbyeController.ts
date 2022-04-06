import { DateResponse } from './types';
import { IGoodbyeController } from './interfaces';
import { LogSuccess } from '../utils/logger';


export class GoodbyeController implements IGoodbyeController {

    public async getDateMessage(name?: string): Promise<DateResponse> {
        LogSuccess('[/api/goodbye] Get Request');

        return {
            message: `Goodbye, ${name || 'World!'}`,
            date: new Date().toDateString()
        };
    }
}
