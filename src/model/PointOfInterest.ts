import { ApiProperty } from "@nestjs/swagger";
import { gql } from "apollo-server-core";
import { Experience } from "./Experience";
import { Locality } from "./Locality";

export class PointOfInterest {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    location: Locality;

    @ApiProperty()
    tags: string[];

    experiences: Experience[];
}

type PoiResponse = {
    id: string;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    tags: {
        type: string;
    }[];
};

export function transformPoiResponse(response: PoiResponse): PointOfInterest {
    const poi = new PointOfInterest();
    poi.id = response.id;
    poi.location = response.location;
    poi.name = response.name;
    poi.tags = [];
    response.tags.forEach((tag) => {
        poi.tags.push(tag.type);
    });
    return poi;
}
