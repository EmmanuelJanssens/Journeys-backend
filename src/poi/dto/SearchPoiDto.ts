import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "src/model/Locality";

export class FindPoisArroundDto {
    @ApiProperty()
    location: Locality;

    @ApiProperty()
    radius: number;
}
