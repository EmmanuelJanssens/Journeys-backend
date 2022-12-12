import {
    ArgumentsHost,
    BadRequestException,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
            exception instanceof HttpException
                ? (exception as HttpException).message
                : "Unexpected Error";
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: message,
            path: request.url
        });
    }
}
