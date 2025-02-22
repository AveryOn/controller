import { ChildProcess, fork } from 'child_process';
import { app } from 'electron';
import { getDistProjectDir } from '../services/fs.service';
import { DbNamesType, InitDbItem, InstanceDatabaseDoc, IpcContractReq, IpcContractRes, UsernameType } from '../types/database/index.types';
import { GlobalNames, Vars } from '../../config/global';
import { TTLStore } from '../services/ttl-store.service';
import { repairKey } from '../services/tokens.service';
import path from 'path';
import fs from 'fs';
import { formatDate } from '../services/date.service';


// Экземпляр базы данных
export class InstanceDatabase implements InstanceDatabaseDoc {
    dbpath: string | null                       = null;
    static instanceDB: InstanceDatabase | null  = null;
    private dbname: DbNamesType | null          = null;
    private processPath: string | null          = null;
    private process: ChildProcess | null        = null;
    private storeTTL: TTLStore<string> | null   = null;

    constructor (dbname: DbNamesType, username: UsernameType, state?: (enabled: boolean) => void) {
        if(!dbname) throw new Error("InstanceDatabase > constructor: dbname is a required");
        if(!username || typeof username !== 'string') throw new Error("InstanceDatabase > constructor: username is a required");

        this.init(dbname, username, (isReliable) => {
            state && state(isReliable);
        });

        // Инит ttl хранилища 
        if(!this.storeTTL) {
            this.storeTTL = TTLStore.getInstance<string>()
        }
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
        this.processPath = path.join(getDistProjectDir(), 'database/init.mjs');

        // Инит процесса и ожидание его доступности
        this.process = fork(this.processPath);
        this.requestIPC({ action: 'init', payload: { dbpath: this.dbpath } }, true)
            .then(({ status }) => state && state(status === 'ok'))
            .catch(() => { state && state(false) });
    }

    // Извлечь ключ шифрования базы данных
    private async fetchPragmaKey(onApp: boolean): Promise<string | undefined | null> {
        try {
            if(!onApp && typeof onApp !== 'boolean') throw new Error('[fetchPragmaKey]>> onApp is not defined');
            if(onApp === true) {
                const key = Vars.APP_KEY
                return key;
            }
            else {
                if(!this.storeTTL) throw new Error('fetchPragmaKey > storeTTL is not defined');
                const key = this.storeTTL.get(GlobalNames.USER_PRAGMA_KEY);
                const salt = this.storeTTL.get(GlobalNames.USER_PRAGMA_SALT);
                if(!key || !salt) {
                    throw new Error('fetchPragmaKey > ');
                }
                return await repairKey(key, salt);
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
                const pragmaKey = await this.fetchPragmaKey(onApp);
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

    /**
     * Проводит rekey ключа шифрования для всех БД пользователя
     * @param username 
     * @param newPragmaKey новый ключ шифрования
     */
    async rekeyAllUserDataBases(username: string, newPragmaKey: string) {
        if(!username) throw TypeError('[rekeyAllUserDataBases]>> invalid username');   
        if(!newPragmaKey) throw TypeError('[rekeyAllUserDataBases]>> invalid newPragmaKey');

        const databases: DbNamesType[] = ['materials'];
        for (const dbname of databases) {
            try {
                const db = new InstanceDatabase(dbname, username);
                const appDataPath = path.join(db.dbpath as string, '..', `backup-${dbname}-${formatDate(Date.now(), 'DD-MM-YY_HH-mm-ss')}.db`);
                console.debug('BACKUP WAS CREATED', appDataPath);
                // Создается бэкап текущей базы данных. 
                // Это нужно чтобы не потерять данные в случае если при изменении ключа произойдет ошибка
                await db.run(`
                    VACUUM INTO ?;
                `, [appDataPath]);
                await db.run(`
                    PRAGMA rekey = '${newPragmaKey}';
                `);
                // В случае если rekey прошел успешно, бэкап удаляется, если выстрелит ошибка, то он остается
                fs.unlinkSync(appDataPath);
            } catch (err) {
                console.log('ERROR DURING REKEY');
                throw err;
            }
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
