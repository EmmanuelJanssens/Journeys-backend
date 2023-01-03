import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { ImageDto } from "../../image/dto/image.dto";
import { ExperienceDto } from "../../experience/dto/experience.dto";
import { PointOfInterest } from "../entities/point-of-interest.entity";

export class PointOfInterestDto extends PickType(PointOfInterest, [
    "id",
    "name",
    "location"
]) {
    @ApiProperty()
    thumbnails?: ImageDto[];
    @ApiProperty()
    experiencesAggregate?: { expCount: number };
    @ApiProperty()
    experiences?: ExperienceDto[];
    @ApiProperty()
    @IsArray()
    tags: string[];
}
