import { Integer, Point } from "neo4j-driver";
import { ExperienceDto } from "../experience/dto/experience.dto";
import { Experience } from "..//experience/entities/experience.entity";
import { PointOfInterestDto } from "../point-of-interest/dto/point-of-interest.dto";
import { PointOfInterest } from "../point-of-interest/entities/point-of-interest.entity";
import { Locality } from "./Locality";
import { Tag } from "../tag/entities/tag.entity";
import { Journey } from "../journey/entities/journey.entity";
import { JourneyDto } from "../journey/dto/journey.dto";
import { Image } from "../image/entities/image.entity";
import { ImageDto } from "src/image/dto/image.dto";

export function transformExperienceToDto(
    experience: Experience,
    images?: Image[],
    poi?: PointOfInterest,
    journey?: Journey
): ExperienceDto {
    const poiDto = poi ? transformPoiToDto(poi) : undefined;
    const imageDto = images ? images : [];
    const dto: ExperienceDto = {
        id: experience.id,
        title: experience.title,
        description: experience.description,
        images: imageDto.map((image) => {
            return {
                id: image.id,
                original: image.original,
                thumbnail: image.thumbnail
            };
        }),
        date: new Date(experience.date).toISOString() as any,
        poi: poiDto,
        journey: journey ? journey.id : undefined
    };
    return dto;
}

export function transformPoiToDto(
    poi: PointOfInterest,
    thumbnail?: string,
    experiences?: Experience[],
    tags?: Tag[],
    expCount?: Integer
): PointOfInterestDto {
    const experiencesDto = experiences
        ? experiences.map((exp) => transformExperienceToDto(exp))
        : [];
    const tagsDto = tags && tags.length > 0 ? tags.map((tag) => tag.type) : [];
    const dto: PointOfInterestDto = {
        id: poi.id,
        name: poi.name,
        thumbnail: thumbnail,
        location: PointToLocation(poi.location as Point),
        tags: tagsDto,
        experiences: experiencesDto,
        experiencesAggregate: expCount ? { expCount: expCount.low } : undefined
    };
    return dto;
}

export function PointToLocation(point: Point): Locality {
    return {
        latitude: point.y,
        longitude: point.x
    };
}

export function transformJourneyToDto(
    journey: Journey,
    creator: string,
    thumbnails: string[],
    experiencesCount: Integer,
    experiences?: Experience[]
) {
    const dto: JourneyDto = {
        id: journey.id,
        title: journey.title,
        description: journey.description,
        start: PointToLocation(journey.start as Point) as Locality,
        end: PointToLocation(journey.end as Point) as Locality,
        visibility: journey.visibility,
        thumbnail: journey.thumbnail,
        thumbnails: thumbnails,
        creator: creator,
        experiencesAggregate: { count: experiencesCount.low },
        experiences: experiences
            ? experiences.map((exp) => {
                  return transformExperienceToDto(exp);
              })
            : []
    };
    return dto;
}

export function transformExperiencesToDto(
    experiences: {
        experience: Experience;
        images: Image[];
        poi: PointOfInterest;
    }[]
) {
    const expDtos = experiences.map((exp) => {
        const poiDto = {
            id: exp.poi.id,
            name: exp.poi.name,
            location: PointToLocation(exp.poi.location as Point)
        };
        const dto: ExperienceDto = {
            id: exp.experience.id,
            title: exp.experience.title,
            description: exp.experience.description,
            images: exp.images.map((image) => {
                return <ImageDto>{
                    id: image.id,
                    original: image.original,
                    thumbnail: image.thumbnail
                };
            }),
            date: new Date(exp.experience.date).toISOString() as any,
            poi: poiDto as PointOfInterestDto
        };
        return dto;
    });
    return expDtos;
}
