import { ApiProperty } from "@nestjs/swagger";

export class User {
    @ApiProperty()
    uid: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    firstname: string;

    @ApiProperty()
    lastname: string;
}
