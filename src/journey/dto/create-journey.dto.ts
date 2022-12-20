import { PickType } from "@nestjs/swagger";
import { CreateExperienceDto } from "src/experience/dto/create-experience.dto";
import { Journey } from "../entities/journey.entity";

export class CreateJourneyDto extends PickType(Journey, [
    "title",
    "description",
    "start",
    "end",
    "visibility"
]) {
    experiences: CreateExperienceDto[];
}
