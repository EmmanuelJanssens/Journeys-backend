import { DynamicModule, Global, Module } from "@nestjs/common";
import * as firebase from "firebase-admin";
import { FirebaseService } from "./firebase.service";

function createApp(config: firebase.ServiceAccount) {
    const app = firebase.initializeApp({
        credential: firebase.credential.cert(config)
    });
    return app;
}

@Global()
@Module({})
export class FirebaseModule {
    static forRoot(config: firebase.ServiceAccount): DynamicModule {
        return {
            module: FirebaseModule,
            providers: [
                FirebaseService,
                {
                    provide: "FB_CONFIG",
                    useValue: config
                },
                {
                    provide: "FB_APP",
                    inject: ["FB_CONFIG"],
                    useFactory: async () => createApp(config)
                }
            ],
            exports: [FirebaseService]
        };
    }
}
