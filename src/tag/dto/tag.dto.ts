import { PartialType } from "@nestjs/swagger";
import { Tag } from "tag/entities/tag.entity";

export class TagDto extends PartialType(Tag) {}
