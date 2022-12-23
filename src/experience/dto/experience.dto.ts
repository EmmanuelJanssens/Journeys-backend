import { IsArray, IsDateString, IsString, IsUUID } from "class-validator";
import { JourneyDto } from "../../journey/dto/journey.dto";
import { PointOfInterestDto } from "../../point-of-interest/dto/point-of-interest.dto";
import { ImageDto } from "../../image/dto/image.dto";
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
    images?: ImageDto[];

    poi?: string | PointOfInterestDto;

    journey?: string | JourneyDto;
}
