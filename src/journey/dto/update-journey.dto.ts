import { PartialType } from "@nestjs/swagger";
import { Journey } from "../entities/journey.entity";
import { CreateJourneyDto } from "./create-journey.dto";

export class UpdateJourneyDto extends PartialType(Journey) {}
