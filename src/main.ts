import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Neo4jService } from "./neo4j/neo4j.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix("api");
    await app.listen(4000);
}
bootstrap();
