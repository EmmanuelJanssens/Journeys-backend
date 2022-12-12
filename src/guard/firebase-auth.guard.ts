import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UseInterceptors
} from "@nestjs/common";
import { Observable } from "rxjs";
import { FirebaseService } from "firebase/firebase.service";
import { Request } from "express";
import { ErrorsInterceptor } from "errors/errors-interceptor.interceptor";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";

@Injectable()
@UseInterceptors(ErrorsInterceptor)
export class FirebaseAuthGuard implements CanActivate {
    logger = new Logger(FirebaseAuthGuard.name);
    constructor(private fb: FirebaseService) {}
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        if (!request.headers.authorization)
            throw new UnauthorizedException(
                "Authentication header not defined"
            );
        const token = request.headers.authorization.replace("Bearer ", "");

        return this.fb
            .getApp()
            .auth()
            .verifyIdToken(token)
            .then((decoded) => {
                request.user = decoded;
                return true;
            })
            .catch((e) => {
                throw e;
            });
    }
}
