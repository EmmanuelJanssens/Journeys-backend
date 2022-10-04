import { Module } from "@nestjs/common";
import { Neo4jModule } from "./neo4j/neo4j.module";
import { PoiModule } from "./poi/poi.module";
import { JourneyModule } from "./journey/journey.module";
import { UserModule } from "./user/user.module";
import { AuthenticationService } from "./authentication/authentication.service";
import { AuthenticationController } from "./authentication/authentication.controller";
import { AuthenticationModule } from "./authentication/authentication.module";
import { JwtService } from "@nestjs/jwt";
import { APP_FILTER } from "@nestjs/core";
import { GeneralExceptionFilter } from "./error/general-exception.filter";

@Module({
    imports: [
        Neo4jModule.forRoot({
            host: "localhost",
            password: "password",
            scheme: "neo4j",
            port: 7687,
            username: "neo4j"
        }),
        PoiModule,
        JourneyModule,
        UserModule,
        AuthenticationModule
    ],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        JwtService,
        {
            provide: APP_FILTER,
            useClass: GeneralExceptionFilter
        }
    ]
})
export class AppModule {}
