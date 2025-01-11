import { PaginatorParams } from "./index.types";

export interface GetUsersConfig extends PaginatorParams {}

export interface PrepareUserStoreParams {
    token: string;
}

export interface UpdatePasswordParams {
    username: string;
    oldPassword: string;
    newPassword: string;
}

export interface CreateUserParams {
    username: string;
    password: string;
}

export interface LoginParams {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: UserClient;
}

export interface UserCreateResponse {
    id: number;
    username: string;
    avatar?: undefined | null | string;
    createdAt: string;
    updatedAt: string;
}

export interface UserClient {
    id: number;
    username: string;
    avatar?: undefined | null | string;
}

export interface User {
    id: number;
    username: string;
    password: string;
    avatar?: undefined | null | string;
    createdAt: string;
    updatedAt: string;
}

export interface UserCreate {
    username: string;
    password: string;
    avatar?: undefined | null | string;
    createdAt: string;
    updatedAt: string;
}

