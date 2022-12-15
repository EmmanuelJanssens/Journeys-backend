import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { ErrorsInterceptor } from "../errors/errors-interceptor.interceptor";

@Module({
    controllers: [UserController],
    providers: [UserService, UserRepository, ErrorsInterceptor]
})
export class UserModule {}
