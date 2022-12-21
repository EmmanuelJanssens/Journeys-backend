import { ExperienceDto } from "./experience.dto";
import { PickType } from "@nestjs/mapped-types";
export class CreateExperienceDto extends PickType(ExperienceDto, [
    "title",
    "description",
    "date",
    "images",
    "poi"
]) {}
