import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { Experience } from "./Experience";
import { Journey } from "./Journey";
import { PointOfInterest } from "./PointOfInterest";
import { User } from "./User";

class AdditionalJourneysInfo {
    @ApiProperty()
    nbExperiences: number;

    @ApiProperty()
    experiences: {
        data: Experience;
        poi: PointOfInterest;
    }[];

    @ApiProperty()
    creator: User;
}

export class JourneyExperiences extends IntersectionType(
    Journey,
    AdditionalJourneysInfo
) {}
