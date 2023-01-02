import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";
import { ExperienceDto } from "../../experience/dto/experience.dto";
import { Journey } from "../entities/journey.entity";
import { PartialType } from "@nestjs/mapped-types";
import { ImageDto } from "../../image/dto/image.dto";
export class JourneyDto extends PartialType(Journey) {
    @ApiProperty()
    @IsNotEmpty()
    creator?: string;

    @ApiProperty()
    @IsArray()
    experiences?: ExperienceDto[];

    @ApiProperty()
    @IsNotEmpty()
    experiencesAggregate?: { count: number };

    @ApiProperty()
    @IsArray()
    thumbnails?: ImageDto[];

    @ApiProperty()
    thumbnail?: ImageDto;
}
