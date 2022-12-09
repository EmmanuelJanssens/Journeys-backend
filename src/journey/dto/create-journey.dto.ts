import { PickType } from "@nestjs/swagger";
import { Journey } from "../entities/journey.entity";

export class CreateJourneyDto extends PickType(Journey, [
    "title",
    "description",
    "start",
    "end",
    "visibility",
    "experiences"
]) {}
