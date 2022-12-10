import { PartialType } from "@nestjs/swagger";
import { PointOfInterest } from "../entities/point-of-interest.entity";

export class PointOfInterestDto extends PartialType(PointOfInterest) {}
