import { Experience } from "src/model/Experience";
import { Locality } from "src/model/Locality";
import { PointOfInterest } from "src/model/PointOfInterest";

export class CreateJourneyDto {
    title: string;
    start: Locality;
    end: Locality;
    visibility: "public" | "private";
    description?: string;
    thumbnail?: string;
    experiences?: {
        data: Experience;
        poi: PointOfInterest;
    }[];
}
