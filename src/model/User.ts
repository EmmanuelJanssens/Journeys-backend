import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { Journey } from "./Journey";
import { PointOfInterest } from "./PointOfInterest";

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

    nJourneys: number;
    nExperiences: number;
    nPois: number;

    journeys: Journey[];
    pois: PointOfInterest[];
}

export class PartialUser extends PartialType(User) {}
export class Authenticated extends PickType(User, [
    "username",
    "uid"
] as const) {}
