import { PartialType } from "@nestjs/swagger";
import { CreateJourneyDto } from "./CreateJourneyDto";

export class UpdateJourneyDto extends PartialType(CreateJourneyDto) {}
