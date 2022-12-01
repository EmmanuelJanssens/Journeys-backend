import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import console from "console";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./log/logging.interceptor";
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: console
    });
    app.setGlobalPrefix("api");
    app.useGlobalInterceptors(new LoggingInterceptor());

    const config = new DocumentBuilder()
        .setTitle("Journeys Api")
        .setDescription("Api used by the journeys APp")
        .setVersion("1.0")
        .addTag("Journeys")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    await app.listen(4000);
}
bootstrap();
