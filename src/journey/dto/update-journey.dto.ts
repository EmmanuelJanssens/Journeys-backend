import { PartialType, PickType } from "@nestjs/swagger";
import { Journey } from "../entities/journey.entity";

export class UpdateJourneyDto extends PickType(Journey, [
    "id",
    "description",
    "thumbnail",
    "title",
    "visibility"
]) {}
