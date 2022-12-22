import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Point } from "neo4j-driver";
import { ExperienceDto } from "src/experience/dto/experience.dto";
import { Locality } from "../../utilities/Locality";
import { Journey } from "../entities/journey.entity";

export class JourneyDto extends Journey {
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
