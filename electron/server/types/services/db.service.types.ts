
export interface DatabaseIpcDto {
    action: string;
    payload?: any;
    status?: "ok" | "error";
}

export interface DatabaseErrorIpcDto {
    action: string;
    payload: { msg: string };
    status: "error";
}