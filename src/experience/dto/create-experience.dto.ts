import { ExperienceDto } from "./experience.dto";
import { PickType } from "@nestjs/mapped-types";
import { IsArray } from "class-validator";
export class CreateExperienceDto extends PickType(ExperienceDto, [
    "title",
    "description",
    "date",
    "poi"
]) {
    @IsArray()
    addedImages?: string[];
}
