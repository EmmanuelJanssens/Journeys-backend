import { ApiProperty } from "@nestjs/swagger";
export class Locality {
    @ApiProperty()
    longitude: number;

    @ApiProperty()
    latitude: number;
}
