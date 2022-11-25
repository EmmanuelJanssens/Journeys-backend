import { NestFactory } from "@nestjs/core";
import console from "console";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./log/logging.interceptor";
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: console
    });
    app.setGlobalPrefix("api");
    app.useGlobalInterceptors(new LoggingInterceptor());
    await app.listen(4000);
}
bootstrap();
