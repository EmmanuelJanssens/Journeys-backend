import { PointOfInterestDto } from "src/point-of-interest/dto/point-of-interest.dto";

export class TagDto {
    type: string;

    tagAggregate: {
        poiCount: number;
    };

    pois?: PointOfInterestDto[];
}
