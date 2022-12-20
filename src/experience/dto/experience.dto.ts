import { PartialType } from "@nestjs/swagger";
import { Experience } from "../entities/experience.entity";

export class ExperienceDto extends PartialType(Experience) {}
