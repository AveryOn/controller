
export interface UserCreateDto {
    username:   string;
    password:   string;
    avatar?:    string | null | undefined;
    createdAt:  string;
    updatedAt:  string;
}

export interface UserFindDto {
    id?:        number;
    username?:  string;
    password?:  string;
    avatar?:    string | null | undefined;
    createdAt?: string;
    updatedAt?: string;
}
