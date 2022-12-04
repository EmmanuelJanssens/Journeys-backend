import { PartialType } from "@nestjs/swagger";

import { Journey } from "src/model/Journey";

export class CreateJourneyDto extends PartialType(Journey) {}
