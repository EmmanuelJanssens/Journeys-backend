import { Inject, Injectable } from "@nestjs/common";
import * as firebase from "firebase-admin";
@Injectable()
export class FirebaseService {
    constructor(
        @Inject("FB_CONFIG") private config: firebase.ServiceAccount,
        @Inject("FB_APP") private readonly app: firebase.app.App
    ) {}

    getApp() {
        return this.app;
    }
}
