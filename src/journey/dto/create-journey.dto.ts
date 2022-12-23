import { CreateExperienceDto } from "../../experience/dto/create-experience.dto";
import { IsArray } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { Journey } from "../entities/journey.entity";
export class CreateJourneyDto extends PartialType(Journey) {
    @IsArray()
    experiences: CreateExperienceDto[];
}
