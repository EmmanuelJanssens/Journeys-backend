import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { FirebaseService } from "src/firebase/firebase.service";
import { Request } from "express";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
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
            .catch(() => {
                //log error
                return false;
            });
    }
}
