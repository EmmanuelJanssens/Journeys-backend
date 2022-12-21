import { PickType, PartialType } from "@nestjs/mapped-types";
import { JourneyDto } from "./journey.dto";

export class UpdateJourneyDto extends PartialType(
    PickType(JourneyDto, [
        "id",
        "title",
        "description",
        "visibility",
        "thumbnail"
    ])
) {}
