import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";
import { ExperienceDto } from "src/experience/dto/experience.dto";
import { Journey } from "../entities/journey.entity";
import { PickType } from "@nestjs/mapped-types";
export class JourneyDto extends PickType(Journey, [
    "id",
    "title",
    "description",
    "thumbnail",
    "visibility",
    "start",
    "end"
]) {
    @ApiProperty()
    @IsNotEmpty()
    creator: string;

    @ApiProperty()
    @IsArray()
    experiences: ExperienceDto[];

    @ApiProperty()
    @IsNotEmpty()
    experiencesAggregate: { count: number };

    @ApiProperty()
    @IsArray()
    thumbnails: string[];
}
