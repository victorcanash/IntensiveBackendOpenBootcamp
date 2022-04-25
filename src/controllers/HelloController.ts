import { Get, Query, Route, Tags, Response } from 'tsoa';
import { StatusCodes } from 'http-status-codes';

import { BasicResponse } from './types';
import { IHelloController } from './interfaces';
import { LogSuccess } from '../utils/logger';


@Route('/api/hello')
@Tags('HelloController')
export class HelloController implements IHelloController {
    
    @Get('/')
    @Response<BasicResponse>(StatusCodes.OK)
    public async getMessage(@Query()name?: string): Promise<BasicResponse> {
        LogSuccess('[/api/hello] Get Request');

        return {
            code: StatusCodes.OK,
            message: `Hello, ${name || 'World!'}`
        };
    }
}
