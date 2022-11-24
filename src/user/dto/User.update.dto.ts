export type UpdateUserDto = {
    firstName?: string;
    lastName?: string;
    banner?: [string];
    visibility?: "public" | "private";
    citation?: string;
};
