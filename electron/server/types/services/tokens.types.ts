
export interface AccessTokenData {
    payload: any;
    expires: number; 
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