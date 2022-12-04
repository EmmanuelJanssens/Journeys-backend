import { Module } from "@nestjs/common";
import { JourneyService } from "src/journey/journey.service";
import { PoiService } from "src/poi/poi.service";
import { UserService } from "src/user/user.service";
import { TagController } from "./tag.controller";
import { TagService } from "./tag.service";

@Module({
    providers: [TagService, UserService, JourneyService, PoiService],
    controllers: [TagController],
    exports: [TagService]
})
export class TagModule {}
