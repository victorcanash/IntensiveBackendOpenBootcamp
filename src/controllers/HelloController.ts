import { Get, Query, Route, Tags } from 'tsoa';
import { BasicResponse } from './types';
import { IHelloController } from './interfaces';
import { LogSuccess } from '../utils/logger';


@Route('/api/hello')
@Tags('HelloController')
export class HelloController implements IHelloController {
    
    @Get('/')
    public async getMessage(@Query()name?: string): Promise<BasicResponse> {
        LogSuccess('[/api/hello] Get Request');

        return {
            message: `Hello, ${name || 'World!'}`
        };
    }
}
