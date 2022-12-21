import { PartialType, IntersectionType, PickType } from "@nestjs/mapped-types";
import { Experience } from "../entities/experience.entity";
import { CreateExperienceDto } from "./create-experience.dto";

export class UpdateExperienceDto extends IntersectionType(
    PickType(Experience, ["id"]),
    PartialType(CreateExperienceDto)
) {}
