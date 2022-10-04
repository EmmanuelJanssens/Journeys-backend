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
};

export type LocationDto = {
    address?: string;
    latitude: number;
    longitude: number;
};

export type ExperienceDto = {
    journey?: JourneyDto;
    poi?: PoiDto;
    experience: {
        description: string;
        order: number;
        image: string[];
        date: string;
    };
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
