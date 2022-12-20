import { ExperienceDto } from "src/experience/entities/experience.entity";
import { PointOfInterest } from "../../point-of-interest/entities/point-of-interest.entity";

export class EditJourneyExperiencesDto {
    connected: {
        experience: ExperienceDto;
        poi: PointOfInterest;
    }[];
    deleted: string[];
    updated: {
        experience: ExperienceDto;
        poi;
    }[];
}
