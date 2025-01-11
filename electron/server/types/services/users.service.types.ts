
export interface UserCreateDto {
    username:   string;
    password:   string;
    avatar?:    string | null | undefined;
    createdAt:  string;
    updatedAt:  string;
}

export interface UserFindByUsernameDto {
    username:  string;
}

export interface UserUpdatePasswordDto {
    password: string;
    username: string;
}
