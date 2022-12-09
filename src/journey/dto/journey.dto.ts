import { PartialType } from "@nestjs/swagger";
import { Journey } from "../entities/journey.entity";

export class JourneyDto extends PartialType(Journey) {}
