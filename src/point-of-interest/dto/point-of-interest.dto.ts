import { ApiProperty } from "@nestjs/swagger";
import { ExperienceDto } from "src/experience/dto/experience.dto";
import { PointOfInterest } from "../entities/point-of-interest.entity";

export class PointOfInterestDto extends PointOfInterest {
    @ApiProperty()
    thumbnail?: string;
    @ApiProperty()
    experiencesAggregate?: { expCount: number };
    @ApiProperty()
    experiences?: ExperienceDto[];
}
