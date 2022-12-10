import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger
} from "@nestjs/common";
import { Observable } from "rxjs";
import { FirebaseService } from "firebase/firebase.service";
import { Request } from "express";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    logger = new Logger(FirebaseAuthGuard.name);
    constructor(private fb: FirebaseService) {}
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
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
                //log error
                this.logger.error(e.message);
                this.logger.debug(e.stack);
                return false;
            });
    }
}
