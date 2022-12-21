import { PartialType } from "@nestjs/swagger";
import { ExperienceDto } from "../../experience/entities/experience.entity";
import { Journey } from "../entities/journey.entity";

export class JourneyDto extends PartialType(Journey) {
    experiences?: ExperienceDto[];
    experiencesAggregate: { count: number };
    thumbnails: string[];
}
