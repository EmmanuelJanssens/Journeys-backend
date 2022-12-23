import { Module } from "@nestjs/common";
import { Neo4jModule } from "./neo4j/neo4j.module";
import { JwtService } from "@nestjs/jwt";
import { APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { FirebaseModule } from "./firebase/firebase.module";
import { PointOfInterestModule } from "./point-of-interest/point-of-interest.module";
import { JourneyModule } from "./journey/journey.module";
import { UserModule } from "./user/user.module";
import { TagModule } from "./tag/tag.module";
import { ExperienceModule } from "./experience/experience.module";
import { ImageModule } from "./image/image.module";
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [".env.local"]
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
        PointOfInterestModule,
        UserModule,
        TagModule,
        ExperienceModule,
        ImageModule
    ],
    providers: []
})
export class AppModule {}
