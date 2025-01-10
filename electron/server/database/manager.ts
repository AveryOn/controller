import { ChildProcess, fork } from 'child_process';
import { app } from 'electron';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type DnNamesType = 'materials';

// контракт запроса
interface IpcContractReq {
    action: string;
    payload: any;
}

// контракт ответа
interface IpcContractRes {
    action: string;
    payload: any;
    status: 'ok' | 'error';
}

export interface InstanceDatabaseDoc {
}

// Экземпляр базы данных
export class InstanceDatabase implements InstanceDatabaseDoc {
    private dbname: DnNamesType | null      = null;
    private dbpath: string | null           = null;
    private processPath: string | null      = null;
    private process: ChildProcess | null    = null;

    constructor (dbname: DnNamesType, username: string, state?: (enabled: boolean) => void) {
        if(!dbname) throw new Error("InstanceDatabase > constructor: dbname is a required");
        if(!username || typeof username !== 'string') throw new Error("InstanceDatabase > constructor: username is a required");
        this.init(dbname, username, (isReliable) => {
            state && state(isReliable);
        })
    };

    private init(dbname: DnNamesType, username: string, state?: (enabled: boolean) => void) {
        this.dbname = dbname as DnNamesType;
        this.dbpath = path.join(app.getPath('appData'), 'controller', `user_${username}`, `${dbname}.db`);
        this.processPath = path.join(__dirname, '../electron/server/database/init.js');
        this.process = fork(this.processPath);
        this.requestIPC({ action: 'init', payload: { dbpath: this.dbpath } })
            .then(({ status }) => state && state(status === 'ok'))
            .catch(() => { state && state(false) });
    }

    // сделать запрос к дочернему процессу и получить ответ
    private async requestIPC(data: IpcContractReq) {
        try {
            if(this.process) {
                const action = `${data.action}-${Date.now()}`;
                let returnData: (data: IpcContractRes) => any;
                const promise: Promise<IpcContractRes> = new Promise((resolve, reject) => {
                    returnData = (res: IpcContractRes) => {
                        if(res.status === 'error') reject(res.payload)
                        if (res.action === action) {
                            resolve(res);
                        }
                    }
                    this.process!.on('message', returnData);
                })
                this.process.send({ action: action, payload: data.payload } as IpcContractReq);
                const response = await promise;
                this.process.removeListener('message', returnData!);
                return response;
            }
            else throw new Error('requestIPC => process is not defined');
        } catch (err) {
            console.log('requestIPC>>', err);
            throw err;
        }
    }

    /* Запросы к sqlite */
    // Выполняет запрос и возвращает все строки результата
    async all(sql: string): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'all', payload: { sql } });
        }
        else throw new Error('all => process is not defined');
    }
    // Выполняет запрос и возвращает одну строку результата
    async get(sql: string): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'get', payload: { sql } });
        }
        else throw new Error('get => process is not defined');
    }
    // Выполняет запрос без возврата результата 
    async run(sql: string): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'run', payload: { sql } });
        }
        else throw new Error('run => process is not defined');
    }
    // Выполняет один или несколько запросов SQL без параметров. Не возвращает результаты, используется для выполнения скриптов.
    async exec(sql: string): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'exec', payload: { sql } });
        }
        else throw new Error('exec => process is not defined');
    }
}

interface InitDbItem {
    constructor: typeof InstanceDatabase;
    arguments: [
        dbname: DnNamesType, 
        username: string, 
    ];
}
// Главный менеджер по управлению базами данных
export class DatabaseManager {
    materials!: InstanceDatabase;
    static instanceManager: DatabaseManager | null  = null;
    private username: string | null                 = null;
    private stateConnectManager: boolean            = true;

    constructor() { }

    // получение экземпляра менеджера
    static instance() {
        if (!DatabaseManager.instanceManager) {
            const instance = new DatabaseManager();
            DatabaseManager.instanceManager = instance;
        }
        return DatabaseManager.instanceManager;
    }

    // Подключение всех баз данных
    private async executeAllInitDB(items: Array<InitDbItem>): Promise<boolean> {
        if(!items || !Array.isArray(items)) throw TypeError('[executeAllInitDB]>> invalid items');   
        for (const item of items) {
            const isReliable: boolean = await new Promise((resolve, reject) => {
                const dbname = item.arguments[0];
                this[dbname] = new item.constructor(...item.arguments, (enabled) => {
                    resolve(enabled);
                })
            });
            this.stateConnectManager = isReliable;
        }
        return this.stateConnectManager;
    }

    // Инициализация Баз Данных
    async init(username: string): Promise<boolean> {
        try {
            this.username = username;
            // здесь поочередно вызываются иниты баз данных. Порядок важен
            return await this.executeAllInitDB([
                { 
                    constructor: InstanceDatabase, 
                    arguments: [
                        'materials', 
                        this.username, 
                    ], 
                },
            ]);
        } catch (err) {
            throw err;
        }
    }
}
