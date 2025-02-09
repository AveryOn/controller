
export type DbNamesType = 'materials' | 'users';
export type UsernameType =  '--' | (string & {});


// контракт запроса
export interface IpcContractReq {
    action: string;
    payload: any;
}

// контракт ответа
export interface IpcContractRes {
    action: string;
    payload: any;
    status: 'ok' | 'error';
}

export interface InitDbItem {
    dbname: DbNamesType,
    isGeneral?: boolean,
}

export interface InstanceDatabaseDoc {
    all: (sql: string, args?: any[]) => Promise<IpcContractRes>;
    get: (sql: string, args?: any[]) => Promise<IpcContractRes>;
    run: (sql: string, args?: any[]) => Promise<IpcContractRes>;
    exec: (sql: string, args?: any[]) => Promise<IpcContractRes>;
    migrate: (config?: { isGeneral?: boolean }) => Promise<IpcContractRes>;
}