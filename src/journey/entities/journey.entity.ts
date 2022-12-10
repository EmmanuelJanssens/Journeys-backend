import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "entities/Locality";
import { PointOfInterest } from "point-of-interest/entities/point-of-interest.entity";
import { Experience } from "entities/experience.entity";
import { PointOfInterestDto } from "point-of-interest/dto/point-of-interest.dto";

export class Journey {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    thumbnail: string;

    thumbnails: string[];

    @ApiProperty()
    visibility: "public" | "private";

    @ApiProperty()
    start: Locality;

    @ApiProperty()
    end: Locality;

    @ApiProperty()
    creator: string;

    experiencesAggregate: { count: number };

    @ApiProperty()
    experiences: {
        experience: Experience;
        poi: PointOfInterestDto;
    }[];
}
