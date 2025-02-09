import { ChildProcess, fork } from 'child_process';
import { app } from 'electron';
import path from 'path'
import { getDistProjectDir } from '../services/fs.service';
import { DbNamesType, InitDbItem, InstanceDatabaseDoc, IpcContractReq, IpcContractRes, UsernameType } from '../types/database/index.types';

// Экземпляр базы данных
export class InstanceDatabase implements InstanceDatabaseDoc {
    static instanceDB: InstanceDatabase | null  = null;
    private dbname: DbNamesType | null          = null;
    private dbpath: string | null               = null;
    private processPath: string | null          = null;
    private process: ChildProcess | null        = null;

    constructor (dbname: DbNamesType, username: UsernameType, state?: (enabled: boolean) => void) {
        if(!dbname) throw new Error("InstanceDatabase > constructor: dbname is a required");
        if(!username || typeof username !== 'string') throw new Error("InstanceDatabase > constructor: username is a required");
        this.init(dbname, username, (isReliable) => {
            state && state(isReliable);
        });
        if(!InstanceDatabase.instanceDB) {
            InstanceDatabase.instanceDB = this;
        }
    };

    // Инициализация базы данных
    private init(dbname: DbNamesType, username: UsernameType, state?: (enabled: boolean) => void) {
        this.dbname = dbname as DbNamesType;
        // если нужно создать БД для общих целей а не для целевого пользователя 
        if(username !== '--') {
            this.dbpath = path.join(app.getPath('appData'), 'controller', `user_${username}`, `${dbname}.db`);
        }
        else {
            this.dbpath = path.join(app.getPath('appData'), 'controller', `${dbname}.db`);
        }
        this.processPath = path.join(getDistProjectDir(), 'database/init.js');

        // Инит процесса и ожидание его доступности
        this.process = fork(this.processPath);
        this.requestIPC({ action: 'init', payload: { dbpath: this.dbpath } }, true)
            .then(({ status }) => state && state(status === 'ok'))
            .catch(() => { state && state(false) });
    }

    // Извлечь ключ шифрования базы данных
    private fetchPragmaKey(onApp: boolean): string | undefined | null {
        try {
            if(!onApp && typeof onApp !== 'boolean') throw new Error('[fetchPragmaKey]>> onApp is not defined');
            if(onApp === true) {
                return process.env.APP_KEY;
            }
            else {
                return 'abc123';
            }
        } catch (err) {
            console.debug('requestIPC>>', err);
            throw err;
        }
    }

    // сделать запрос к дочернему процессу и получить ответ
    private async requestIPC(data: IpcContractReq, onApp: boolean) {
        try {
            if(this.process) {
                const pragmaKey = this.fetchPragmaKey(onApp);
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
                this.process.send({ 
                    action, 
                    payload: { ...data.payload, pragmaKey },
                } as IpcContractReq);
                const response = await promise;
                this.process.removeListener('message', returnData!);
                return response;
            }
            else throw new Error('requestIPC => process is not defined');
        } catch (err) {
            console.debug('requestIPC>>', err);
            throw err;
        }
    }

    /* Запросы к sqlite */
    // Выполняет запрос и возвращает все строки результата
    async all(sql: string, args?: any[], onApp: boolean = false): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'all', payload: {
                sql, 
                arguments: args,
            } }, onApp);
        }
        else throw new Error('all => process is not defined');
    }
    // Выполняет запрос и возвращает одну строку результата
    async get(sql: string, args?: any[], onApp: boolean = false): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'get', payload: {
                sql, 
                arguments: args,
            } }, onApp);
        }
        else throw new Error('get => process is not defined');
    }
    // Выполняет запрос без возврата результата 
    async run(sql: string, args?: any[], onApp: boolean = false): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'run', payload: {
                sql, 
                arguments: args,
            } }, onApp);
        }
        else throw new Error('run => process is not defined');
    }
    // Выполняет один или несколько запросов SQL без параметров. Не возвращает результаты, используется для выполнения скриптов.
    async exec(sql: string, args?: any[], onApp: boolean = false): Promise<IpcContractRes> {
        if (this.process) {
            return await this.requestIPC({ action: 'exec', payload: { 
                sql, 
                arguments: args,
            } }, onApp);
        }
        else throw new Error('exec => process is not defined');
    }
    // Запуск миграций для текущей базы данных
    async migrate(config: { isGeneral: boolean, pragmaKey: string | undefined }): Promise<IpcContractRes> {
        if(!config) throw new Error('[migrate]>> config is not defined');
        if (this.process) {
            return await this.requestIPC({ 
                action: `migrate:${this.dbname}`, 
                payload: { ...config }, 
            }, config.isGeneral);
        }
        else throw new Error('exec => process is not defined');
    }
}


// Главный менеджер по управлению базами данных
export class DatabaseManager {
    private instanceDatabaseList: { [key: string]: InstanceDatabase } = Object.create(null);
    static instanceManager: DatabaseManager | null  = null;
    private username: string | null                 = null;
    private stateConnectManager: boolean            = true;

    constructor() { }

    // получение экземпляра менеджера
    static instance() {
        if (!DatabaseManager.instanceManager) {
            console.debug('DatabaseManager > created a new DB manager instance');
            
            const instance = new DatabaseManager();
            DatabaseManager.instanceManager = instance;
        }
        return DatabaseManager.instanceManager;
    }

    // Подключение всех баз данных
    private async executeAllInitDB(username: UsernameType, items: Array<InitDbItem>): Promise<boolean> {
        if(!items || !Array.isArray(items)) throw TypeError('[executeAllInitDB]>> invalid items');   
        try {
            for (const item of items) {
                const isReliable: boolean = await new Promise((resolve) => {
                    const dbname = item.dbname;
                    this.instanceDatabaseList[dbname] = new InstanceDatabase(dbname, username, (enabled) => {
                        resolve(enabled);
                    })
                });
                this.stateConnectManager = isReliable;
            }
            return this.stateConnectManager;
        } catch (err) {
            console.error('[executeAllInitDB]>> ', err);
            throw err;
        }
    }
    
    // Залутать инстанс БД
    getDatabase(dbname: DbNamesType): InstanceDatabase {
        const ins = this.instanceDatabaseList[dbname]
        if(!ins || !(ins instanceof InstanceDatabase)) {
            throw new Error(`getDatabase > the instance \"${dbname}\" was not initialized`)
        }
        return ins;
    }

    // Инициализация Баз Данных уровня приложения
    async initOnApp(config?: { migrate?: boolean }) {
        try {
            // здесь поочередно вызываются иниты баз данных. Порядок важен
            const promise = this.executeAllInitDB('--', [
                { dbname: 'users', isGeneral: true },
            ]);
            // вызов миграций
            if(config?.migrate === true) {
                await this.executeMigrations({ pragmaKey: process.env.APP_KEY, isGeneral: true });
                console.debug("initOnApp>> migrations were applied");
            }
            return await promise;
        } catch (err) {
            console.error('[DatabaseManager.initOnApp]>> ', err);
            throw err;
        }
    }

    // Инициализация Баз Данных уровня пользователя
    async initOnUser(username: string, config?: { migrate?: boolean }): Promise<boolean> {
        try {
            this.username = username;
            // здесь поочередно вызываются иниты баз данных. Порядок важен
            const promise = this.executeAllInitDB(username, [
                { dbname: 'materials', isGeneral: false },
            ]);
            // вызов миграций
            if(config?.migrate === true) {
                const keyDB = 'abc123'
                await this.executeMigrations({ pragmaKey: keyDB, isGeneral: false });
                console.debug("initOnUser>> migrations were applied");
            }
            console.log('WAS CALLED initOnUser', username);
            return await promise;
        } catch (err) {
            console.error('[DatabaseManager.initOnUser]>> ', err);
            throw err;
        }
    }

    // применить миграции для всех баз данных
    async executeMigrations(config: { isGeneral: boolean, pragmaKey: string | undefined }) {
        try {
            for (let key in this.instanceDatabaseList) {
                if (Object.prototype.hasOwnProperty.apply(this.instanceDatabaseList, [key])) {
                    const db = this.instanceDatabaseList[key];
                    await db.migrate(config);
                }
            }
        } catch (err) {
            console.error('executeMigrations>>', err);
            throw err;
        }
    }
}
