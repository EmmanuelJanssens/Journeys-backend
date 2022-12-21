import { IsArray } from "class-validator";
import { ExperienceDto } from "src/experience/entities/experience.entity";
import { PointOfInterest } from "../../point-of-interest/entities/point-of-interest.entity";

export class EditJourneyExperiencesDto {
    @IsArray()
    connected: {
        experience: ExperienceDto;
        poi: PointOfInterest;
    }[];

    @IsArray()
    deleted: string[];

    @IsArray()
    updated: {
        experience: ExperienceDto;
        poi;
    }[];
}
