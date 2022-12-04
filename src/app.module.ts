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
import { ConfigModule } from "@nestjs/config";
import { FirebaseModule } from "./firebase/firebase.module";
import { TagModule } from "./tag/tag.module";
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
        FirebaseModule.forRoot({
            clientEmail: process.env.FB_CLIENT_EMAIL,
            privateKey: process.env.FB_PRIVATE_KEY,
            projectId: process.env.GOOGLE_PROJECT_ID
        }),
        PoiModule,
        JourneyModule,
        UserModule,
        AuthenticationModule,
        TagModule
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
