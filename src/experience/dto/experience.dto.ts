import { IsArray, IsDateString, IsString, IsUUID } from "class-validator";
import { JourneyDto } from "src/journey/dto/journey.dto";
import { PointOfInterestDto } from "src/point-of-interest/dto/point-of-interest.dto";

export class ExperienceDto {
    @IsUUID()
    id: string;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsDateString()
    date: string;

    @IsArray()
    images: string[];

    poi?: string | PointOfInterestDto;

    journey?: string | JourneyDto;
}
