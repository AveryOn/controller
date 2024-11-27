
export interface User {
    id: number;
    username: string;
    password: string;
    avatar?: string;
}


export interface LoginResponse {
    token: string;
    user: User;
}