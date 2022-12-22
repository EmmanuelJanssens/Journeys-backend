import { PickType } from "@nestjs/mapped-types";
import { PointOfInterestDto } from "./point-of-interest.dto";

export class CreatePointOfInterestDto extends PickType(PointOfInterestDto, [
    "location",
    "name",
    "tags"
]) {}
