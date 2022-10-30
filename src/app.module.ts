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
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { Neo4jService } from "./neo4j/neo4j.service";
import { GraphQLSchema } from "graphql";
@Module({
    imports: [
        Neo4jModule.forRoot({
            host: "localhost",
            password: "password",
            scheme: "neo4j",
            port: 7687,
            username: "neo4j"
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [Neo4jModule],
            useFactory: async (neo4j: Neo4jService) => ({
                schema: new GraphQLSchema(
                    (await neo4j.getSchema().getSchema()).toConfig()
                ),
                playground: true
            }),
            inject: [Neo4jService]
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
