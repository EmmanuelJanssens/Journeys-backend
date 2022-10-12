import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as session from "express-session";
import * as passport from "passport";
import { Neo4jService } from "./neo4j/neo4j.service";
import * as Neo4jStore from "connect-neo4j";
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix("api");
    const neo4j = app.get<Neo4jService>(Neo4jService);

    const store = Neo4jStore(session);
    app.use(
        session({
            store: new store({ client: neo4j.getDriver() }),
            saveUninitialized: false,
            secret: "12345",
            resave: false
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    await app.listen(4000);
}
bootstrap();
