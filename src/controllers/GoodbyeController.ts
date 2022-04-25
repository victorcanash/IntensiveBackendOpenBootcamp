import { Get, Query, Route, Tags, Response } from 'tsoa';
import { StatusCodes } from 'http-status-codes';

import { DateResponse } from './types';
import { IGoodbyeController } from './interfaces';
import { LogSuccess } from '../utils/logger';


@Route('/api/goodbye')
@Tags('GoodbyeController')
export class GoodbyeController implements IGoodbyeController {

    @Get('/')
    @Response<DateResponse>(StatusCodes.OK)
    public async getDateMessage(@Query()name?: string): Promise<DateResponse> {
        LogSuccess('[/api/goodbye] Get Request');

        return {
            code: StatusCodes.OK,
            message: `Goodbye, ${name || 'World!'}`,
            date: new Date().toDateString()
        };
    }
}
