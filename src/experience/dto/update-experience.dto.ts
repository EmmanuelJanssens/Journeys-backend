import { PartialType, IntersectionType, PickType } from "@nestjs/mapped-types";
import { CreateExperienceDto } from "./create-experience.dto";
import { ExperienceDto } from "./experience.dto";
export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {
    id?: string;
    addedImages?: string[];
    removedImages?: string[];
}
