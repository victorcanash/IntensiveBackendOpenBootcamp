import { Get, Query, Route, Tags } from 'tsoa';
import { DateResponse } from './types';
import { IGoodbyeController } from './interfaces';
import { LogSuccess } from '../utils/logger';


@Route('/api/goodbye')
@Tags('GoodbyeController')
export class GoodbyeController implements IGoodbyeController {

    @Get('/')
    public async getDateMessage(@Query()name?: string): Promise<DateResponse> {
        LogSuccess('[/api/goodbye] Get Request');

        return {
            message: `Goodbye, ${name || 'World!'}`,
            date: new Date().toDateString()
        };
    }
}
