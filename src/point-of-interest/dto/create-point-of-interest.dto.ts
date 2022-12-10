import { PickType } from "@nestjs/swagger";
import { PointOfInterest } from "../entities/point-of-interest.entity";

export class CreatePointOfInterestDto extends PickType(PointOfInterest, [
    "location",
    "name",
    "tags"
]) {}
