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
    experiences?: ExperienceDto[];
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
    updated?: {
        poi: PoiDto;
        experience: {
            title: string;
            description: string;
            images: string[];
            date: string;
        };
    }[];
    deleted?: {
        poi_ids: string[];
    };
    connected?: {
        experience: ExperienceDto;
    }[];
};
export type ExperienceDto = {
    journey?: JourneyDto;
    poi: PoiDto;
    updated?: {
        poi: PoiDto;
        experience: {
            title: string;
            description: string;
            images: string[];
            date: string;
        };
    };
    deleted?: {
        id: string[];
    };
    connected?: {
        poi: PoiDto;
        experience: {
            title: string;
            description: string;
            images: string[];
            date: string;
        };
    }[];
    experience: {
        title: string;
        description: string;
        order: number;
        images: string[];
        date: string;
    };
    id?: number;
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
};

export type UserDto = {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    token?: string;
};
