import { CreateExperienceDto } from "src/experience/dto/create-experience.dto";
import { IsArray } from "class-validator";
import { PickType } from "@nestjs/swagger";
import { JourneyDto } from "./journey.dto";
export class CreateJourneyDto extends PickType(JourneyDto, [
    "title",
    "description",
    "start",
    "end",
    "visibility"
]) {
    @IsArray()
    experiences: CreateExperienceDto[];
}
