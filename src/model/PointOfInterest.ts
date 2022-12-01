import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "./Locality";

export class PointOfInterest {
    @ApiProperty()
    uid: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    location: Locality;
}
