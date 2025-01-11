
export interface User {
    id: number;
    username: string;
    password: string;
    avatar?: string;
}


export interface LoginResponseApi {
    token: string;
    user: User;
}

export interface CreateUserParamsApi {
    username: string;
    password: string;
}

export interface UpdUserPasswordApi {
    username: string;
    oldPassword: string;
    newPassword: string;
}

export interface UserCreateResponseApi {
    id: number;
    username: string;
    avatar?: undefined | null | string;
    createdAt: string;
    updatedAt: string;
}

export interface ValidateAccessTokenParamsApi {
    token: string | null | undefined;
}