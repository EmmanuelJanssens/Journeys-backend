import { User } from "@firebase/auth-types";
import { ApiProperty } from "@nestjs/swagger";
import { Locality } from "./Locality";

export class Journey {
    @ApiProperty()
    uid: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    thumbnail: string;

    @ApiProperty()
    visibility: "public" | "private";

    @ApiProperty()
    start: Locality;

    @ApiProperty()
    end: Locality;
}
