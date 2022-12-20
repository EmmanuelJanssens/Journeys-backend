import { Experience } from "../entities/experience.entity";
import { PickType } from "@nestjs/swagger";
export class CreateExperienceDto extends PickType(Experience, [
    "title",
    "description",
    "date",
    "images"
]) {}
