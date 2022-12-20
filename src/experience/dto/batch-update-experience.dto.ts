import { CreateExperienceDto } from "./create-experience.dto";
import { UpdateExperienceDto } from "./update-experience.dto";

export class BatchUpdateExperienceDto {
    connected: CreateExperienceDto[];
    deleted: string[];
    updated: UpdateExperienceDto[];
}
