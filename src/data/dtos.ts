import { Experience } from "src/model/Experience";
import { Locality } from "src/model/Locality";
import { PointOfInterest } from "src/model/PointOfInterest";

export type SearchPoiDto = {
    lat: number;
    lng: number;
    radius: number;
    page?: number;
    pageSize?: number;
};

export type PoiDto = {
    id?: string;
    name?: string;
    location?: AddressDto;
    journeysConnection: {
        edges: ExperienceDto[];
    };
    thumbnail?: string;
};

export type AddressDto = {
    placeId: string;
    address?: string;
    latitude: number;
    longitude: number;
};

export type UpdateJourneyDto = {
    updated?: ExperienceDto[];
    deleted?: {
        poi_ids: string[];
    };
    connected?: ExperienceDto[];
};
export type DeleteExperience = {
    poi: PoiDto;
    journey: JourneyDto;
};
export type UpdateExperienceDto = {
    journey: JourneyDto;
    experience: ExperienceDto;
};
//export typeExperienceDto
export type ExperienceDto = {
    title: string;
    description: string;
    order: number;
    images: string[];
    date: string;
    node?: PoiDto | JourneyDto;
};

export type JourneyDto = {
    id?: string;
    title?: string;
    description?: string;
    start?: Locality;
    end?: Locality;
    thumbnail?: string;
    creator?: UserDto;
    experienceCount?: number;
    experiences?: {
        data: Experience;
        poi: PointOfInterest;
    }[];
    experienceAggregate?: { count: number };
    experiencesConnection?: {
        edges: {
            title: string;
            date: string;
            description: string;
            images: string[];
            order: number;
            node: {
                id: string;
                name: string;
                location: {
                    latitude: number;
                    longitude: number;
                };
            };
        }[];
    };
};

export type UpdateUserDto = {
    user: UserDto;
    oldUsername: string;
};
export type UserDto = {
    uid: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    refreshToken?: string;
    token?: string;
    public?: boolean;
    citation?: string;
    banner?: string[];
    journeysAggregate?: {
        count: number;
    };
    journeysConnection?: {
        edges: [{ node: { experiencesAggregate: { count: number } } }];
    };
};
