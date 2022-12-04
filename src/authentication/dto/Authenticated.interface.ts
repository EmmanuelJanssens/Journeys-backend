export type Authenticated = {
    username: string;
    uid: string;
};

export type RegisterUserDo = {
    username: string;
    email: string;
    uid: string;
    firstname?: string;
    lastName?: string;
};
