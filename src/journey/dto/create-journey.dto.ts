import { Point } from "neo4j-driver";
import { Locality } from "src/entities/Locality";
import { CreateExperienceDto } from "src/experience/dto/create-experience.dto";
import { IsArray, IsNotEmpty, IsString } from "class-validator";
export class CreateJourneyDto {
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

    @IsArray()
    experiences: CreateExperienceDto[];
}
