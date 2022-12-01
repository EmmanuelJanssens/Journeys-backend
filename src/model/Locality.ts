import { ApiProperty } from "@nestjs/swagger";

export class Locality {
    @ApiProperty()
    longitude: number;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    uid: string;
}
