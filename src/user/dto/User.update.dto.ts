export type UpdateUserDto = {
    username?: string;
    firstName?: string;
    lastName?: string;
    banner?: [string];
    visibility?: "public" | "private";
    citation?: string;
};
