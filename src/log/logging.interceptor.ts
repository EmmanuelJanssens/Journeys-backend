import {
    BadGatewayException,
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor
} from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const logger = new Logger(context.getHandler().name);
        return next.handle().pipe(
            catchError((err) =>
                throwError(() => {
                    logger.error(err.message);
                    logger.debug(err.stack);
                    err;
                })
            )
        );
    }
}
