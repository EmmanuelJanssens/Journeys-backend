import { IsArray } from "class-validator";
import { ExperienceDto } from "../../experience/dto/experience.dto";
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
