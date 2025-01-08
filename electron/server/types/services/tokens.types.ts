export interface AccessTokenPayload {
    userId: number | string;
    username: string;
}
export interface AccessTokenData {
    payload: AccessTokenPayload;
    expires: number; 
    signature: string;
}

export interface ExpiresToken {
    ms?: number;
    s?: number;
    m?: number;
    h?: number;
    d?: number;
    M?: number;
    Y?: number;
}