export type Authenticated = {
    username: string;
    uid: string;
};

export type Register = {
    username: string;
    email: string;
    uid: string;
    firstname?: string;
    lastName?: string;
};
