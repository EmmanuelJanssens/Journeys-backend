import { ApiProperty } from "@nestjs/swagger";
import { Experience } from "./Experience";
import { Locality } from "./Locality";
import { PointOfInterest } from "./PointOfInterest";
import { User } from "./User";
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

    // @ApiProperty()
    // nbExperiences: number;

    nExperiences: number;
    @ApiProperty()
    experiences: {
        data: Experience;
        poi: PointOfInterest;
    }[];

    @ApiProperty()
    creator: string;
}
