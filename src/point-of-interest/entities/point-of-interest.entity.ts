import { ApiProperty } from "@nestjs/swagger";
import { Experience } from "entities/experience.entity";
import { Locality } from "entities/Locality";

export class PointOfInterest {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    location: Locality;

    @ApiProperty()
    tags: string[];

    nExperiences: number;

    experiences: Experience[];

    thumbnail: string;
}
