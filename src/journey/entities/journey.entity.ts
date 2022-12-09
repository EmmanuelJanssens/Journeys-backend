import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "src/entities/Locality";
import { PointOfInterest } from "src/point-of-interest/entities/point-of-interest.entity";
import { Experience } from "src/entities/experience.entity";

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

    @ApiProperty()
    experiences: {
        experience: Experience;
        poi: PointOfInterest;
    }[];
}
