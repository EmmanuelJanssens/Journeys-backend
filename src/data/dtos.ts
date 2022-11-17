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
    description?: string;
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
    journey?: JourneyDto;
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
    journey?: JourneyDto;
};

export type JourneyDto = {
    id?: string;
    title?: string;
    description?: string;
    start?: AddressDto;
    end?: AddressDto;
    creator?: UserDto;
    experienceCount?: number;
    experiences?: ExperienceDto[];
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

export type UserDto = {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    refreshToken?: string;
    token?: string;
};
