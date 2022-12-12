import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NestInterceptor,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { Observable, catchError, throwError } from "rxjs";
import {
    BadInputError,
    CreationError,
    NotFoundError,
    ReadError,
    UserPrivateError
} from "./Errors";

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const logger = new Logger(context.getHandler().name);
        return next.handle().pipe(
            catchError((err) => {
                logger.debug(err.stack);
                if (err instanceof UserPrivateError)
                    return throwError(
                        () => new UnauthorizedException(err.message)
                    );
                if (err instanceof NotFoundError)
                    return throwError(() => new NotFoundException(err.message));
                else if (
                    err instanceof CreationError ||
                    err instanceof BadInputError ||
                    err instanceof ReadError
                )
                    return throwError(
                        () => new BadRequestException(err.message)
                    );
                else
                    return throwError(
                        () => new HttpException("Unexpected error", 500)
                    );
            })
        );
    }
}
