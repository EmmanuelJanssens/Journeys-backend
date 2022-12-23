import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { ExperienceDto } from "src/experience/dto/experience.dto";
import { PointOfInterest } from "../entities/point-of-interest.entity";

export class PointOfInterestDto extends PickType(PointOfInterest, [
    "id",
    "name",
    "location"
]) {
    @ApiProperty()
    thumbnail?: string;
    @ApiProperty()
    experiencesAggregate?: { expCount: number };
    @ApiProperty()
    experiences?: ExperienceDto[];
    @ApiProperty()
    @IsArray()
    tags: string[];
}
