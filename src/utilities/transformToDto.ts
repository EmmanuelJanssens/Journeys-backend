import { Point } from "neo4j-driver";
import { ExperienceDto } from "../experience/dto/experience.dto";
import { Experience } from "..//experience/entities/experience.entity";
import { PointOfInterestDto } from "../point-of-interest/dto/point-of-interest.dto";
import { PointOfInterest } from "../point-of-interest/entities/point-of-interest.entity";
import { Locality } from "./Locality";

export function transformExperienceToDto(
    experience: Experience,
    poi?: PointOfInterest
): ExperienceDto {
    const poiDto = poi ? transformPoiToDto(poi) : undefined;
    const dto: ExperienceDto = {
        id: experience.id,
        title: experience.title,
        description: experience.description,
        images: experience.images,
        date: new Date(experience.date).toISOString() as any,
        poi: poiDto
    };
    return dto;
}

export function transformPoiToDto(poi: PointOfInterest): PointOfInterestDto {
    const dto: PointOfInterestDto = {
        id: poi.id,
        name: poi.name,
        location: PointToLocation(poi.location as Point)
    };
    return dto;
}

export function PointToLocation(point: Point): Locality {
    return {
        latitude: point.y,
        longitude: point.x
    };
}
