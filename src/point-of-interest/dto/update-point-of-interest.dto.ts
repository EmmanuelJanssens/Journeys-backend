import { PartialType } from "@nestjs/swagger";
import { CreatePointOfInterestDto } from "./create-point-of-interest.dto";

export class UpdatePointOfInterestDto extends PartialType(
    CreatePointOfInterestDto
) {}
