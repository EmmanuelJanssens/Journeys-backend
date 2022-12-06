import { Module } from "@nestjs/common";
import { PoiService } from "src/poi/poi.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    controllers: [UserController],
    providers: [UserService, PoiService]
})
export class UserModule {}
