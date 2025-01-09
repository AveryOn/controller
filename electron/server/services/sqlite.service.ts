import Database from 'better-sqlite3';
import path from 'path'
import { app } from 'electron';
import { isExistFileOrDir } from './fs.service';
import { execProcess } from './process.service';

const dblist = {
    MATERIALS_DB_NAME:  process.env['MATERIALS_DB_NAME'] || 'materials',
    SETTINGS_DB_NAME:   process.env['SETTINGS_DB_NAME'] || 'settings',
    SECRETS_DB_NAME:    process.env['SECRETS_DB_NAME'] || 'secrets',
}

// Подключение к БД. Формирование экземпляра
export async function initDB(dbname: keyof typeof dblist, username: string)/* : Promise<Database> */ {
    try {
        if(!dbname || !Object.prototype.hasOwnProperty.call(dblist, dbname)) {
            throw new Error('[sqlite.initDB]>> invalid dbname');
        }
        const dbFileName: string = dblist[dbname];
        const fullDbPath = path.join(app.getPath('appData'), 'controller', `user_${username}`, `${dblist[dbname]}.db`)
        const isExist = await isExistFileOrDir(fullDbPath, { custom: true });
        console.log(`БД ${dbFileName} уже существует`);
        // const db = new Database(fullDbPath);
        const dbProcess = execProcess(path.join(import.meta.dirname, '..', 'electron/server/database/init.js'));
        dbProcess.send({ action: 'db:init', payload: { dbpath: fullDbPath }});
        dbProcess.on('message', ({ action, status, payload }: any) => {
            if(status === 'ok') {
                console.log('ok');
                
            }
            console.log({ action, status, payload })
        });
    } catch (err) {
        console.error(`[initDB=>${dbname}]>>`, err);
        throw err;
    }
  
}