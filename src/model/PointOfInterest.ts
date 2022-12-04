import { ApiProperty } from "@nestjs/swagger";
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
}
