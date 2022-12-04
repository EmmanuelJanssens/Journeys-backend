import { ApiProperty, PickType } from "@nestjs/swagger";

export class User {
    @ApiProperty()
    uid: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    firstname: string;

    @ApiProperty()
    lastname: string;

    @ApiProperty()
    completed: boolean;
}

export class Authenticated extends PickType(User, [
    "username",
    "uid"
] as const) {}
