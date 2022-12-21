import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Point } from "neo4j-driver";
import { Locality } from "src/entities/Locality";
import { ExperienceDto } from "../../experience/entities/experience.entity";

export class JourneyDto {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsNotEmpty()
    start: Point | Locality;

    @IsNotEmpty()
    end: Point | Locality;

    @IsString()
    visibility: string;

    @IsNotEmpty()
    creator: string;

    @IsString()
    thumbnail?: string;

    @IsArray()
    experiences?: ExperienceDto[];

    @IsNotEmpty()
    experiencesAggregate?: { count: number };

    @IsArray()
    thumbnails?: string[];
}
