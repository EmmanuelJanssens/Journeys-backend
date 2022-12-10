import { Module } from "@nestjs/common";
import { Neo4jModule } from "./neo4j/neo4j.module";
import { JwtService } from "@nestjs/jwt";
import { APP_FILTER } from "@nestjs/core";
import { GeneralExceptionFilter } from "./exceptions/general-exception.filter";
import { ConfigModule } from "@nestjs/config";
import { FirebaseModule } from "./firebase/firebase.module";
import { PointOfInterestModule } from "./point-of-interest/point-of-interest.module";
import { JourneyModule } from "./journey/journey.module";
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [".env"]
        }),
        Neo4jModule.forRoot({
            host: process.env.NEO4J_HOST,
            password: process.env.NEO4J_PWD,
            scheme: process.env.NEO4J_SCHEME,
            port: process.env.NEO4J_PORT,
            username: process.env.NEO4j_USER
        }),
        FirebaseModule.forRoot({
            clientEmail: process.env.FB_CLIENT_EMAIL,
            privateKey: process.env.FB_PRIVATE_KEY,
            projectId: process.env.GOOGLE_PROJECT_ID
        }),
        JourneyModule,
        PointOfInterestModule
    ],
    providers: [
        JwtService,
        {
            provide: APP_FILTER,
            useClass: GeneralExceptionFilter
        }
    ]
})
export class AppModule {}
