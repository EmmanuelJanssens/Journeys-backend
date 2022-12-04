import { ApiProperty } from "@nestjs/swagger";
import { Experience } from "src/model/Experience";
import { Journey } from "src/model/Journey";
import { PointOfInterest } from "src/model/PointOfInterest";

export class UpdateJourneyExperiencesDto {
    @ApiProperty()
    journey?: Journey;

    @ApiProperty({
        description: "All of the experiences that have been updated",
        isArray: true
    })
    updated?: {
        data: Experience;
        poi: PointOfInterest;
    }[];

    @ApiProperty({
        description: "All of the experiences that have been deleted",
        isArray: true
    })
    deleted?: string;

    @ApiProperty({
        description:
            "All of the experiences that have been connected  (All new experiences to the journey)",
        isArray: true
    })
    connected?: {
        data: Experience;
        poi: PointOfInterest;
    }[];
}
