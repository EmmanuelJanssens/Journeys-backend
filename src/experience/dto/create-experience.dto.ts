import { PickType } from "@nestjs/swagger";
import { ExperienceDto } from "../entities/experience.entity";
export class CreateExperienceDto extends PickType(ExperienceDto, [
    "title",
    "description",
    "date",
    "images",
    "poi"
]) {}
