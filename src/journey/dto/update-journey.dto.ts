import { PartialType } from "@nestjs/swagger";
import { Journey } from "../entities/journey.entity";

export class UpdateJourneyDto extends PartialType(Journey) {}
