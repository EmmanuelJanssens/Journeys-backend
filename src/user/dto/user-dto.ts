import { ApiProperty, PartialType } from "@nestjs/swagger";
import { PointOfInterestDto } from "../../point-of-interest/dto/point-of-interest.dto";
import { JourneyDto } from "../../journey/dto/journey.dto";
import { User } from "../entities/user.entity";

export class UserDto extends PartialType(User) {
    @ApiProperty()
    journeys: JourneyDto[];

    @ApiProperty()
    journeysAggregate: { count: number };

    @ApiProperty()
    pois: PointOfInterestDto[];

    @ApiProperty()
    poisAggregate: { count: number };

    @ApiProperty()
    experiencesAggregate: { count: number };
}
