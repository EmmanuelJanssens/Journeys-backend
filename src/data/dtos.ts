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
    location?: LocationDto;
    experiences?: ExperienceDto[];
    thumbnail?: string;
};

export type LocationDto = {
    address?: string;
    latitude: number;
    longitude: number;
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
    start?: LocationDto;
    end?: LocationDto;
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
