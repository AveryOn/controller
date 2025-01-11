import pkg from 'sqlite3';
const { verbose } = pkg;
import materialsMigration from './migrations/materials.migration.js';
import usersMigration from './migrations/users.migration.js';

const migrations = {
    "migrate:materials": materialsMigration,
    "migrate:users": usersMigration,
}

let db = null;
process.on("message", async (msg) => {
    
    if(msg && msg.action) {
        // инициализация базы данных
        if(msg.action.includes('init')) {
            if(!msg.payload?.dbpath) throw new Error('dbpath is a required')
            const sqlite3 = verbose();
            db = new sqlite3.Database(msg?.payload?.dbpath, (err) => {
                if(err) {
                    console.log(err);
                    process.send({ action: msg.action, payload: err, status: 'error' });
                }
                else {
                    console.log('OK');
                    process.send({ 
                        action: msg.action, 
                        payload: null, 
                        status: 'ok' 
                    })
                }
            });
        }
        // Запуск миграций
        if(msg.action.includes('migrate:')) {
            Object.keys(migrations).forEach(async (key) => {
                if(msg.action.includes(key)) {
                    const migrateList = migrations[key];
                    if(Array.isArray(migrateList)) {
                        for (const sql of migrateList) {
                            await new Promise((resolve) => {
                                db.exec(sql, (err) => {
                                    if(err) process.send({ action: msg.action, payload: err, status: 'error' });
                                    else {
                                        process.send({ 
                                            action: msg.action, 
                                            payload: null, 
                                            status: 'ok' 
                                        })
                                        resolve(true);
                                    }
                                });
                            })
                        }
                    }
                }
            })
        }
        // для all запросов 
        if(msg.action.includes('all')) {
            db.all(msg.payload.sql, (err, rows) => {
                if(err) {
                    process.send({ action: msg.action, payload: err, status: 'error' });
                }
                else {
                    process.send({ 
                        action: msg.action, 
                        payload: rows ?? null, 
                        status: 'ok' 
                    })
                }
            })
        }
        // для get запросов
        if(msg.action.includes('get')) {
            db.get(msg.payload.sql, msg.payload.arguments, (err, row) => {
                if(err) {
                    console.log('ERROR', err);
                    process.send({ action: msg.action, payload: err, status: 'error' });
                }
                else {
                    process.send({ 
                        action: msg.action, 
                        payload: row, 
                        status: 'ok' 
                    })
                }
            });
        }
        // для run запросов
        if(msg.action.includes('run')) {
            db.run(msg.payload.sql, msg.payload.arguments, (err, data) => {
                if(err) {
                    console.log(err);
                    process.send({ action: msg.action, payload: err, status: 'error' });
                }
                else {
                    process.send({ 
                        action: msg.action, 
                        payload: data, 
                        status: 'ok' 
                    })
                }
            });
        }
        // для exec запросов
        if(msg.action.includes('exec')) {
            db.exec(msg.payload.sql, msg.payload.arguments, (err) => {
                if(err) {
                    process.send({ action: msg.action, payload: err, status: 'error' });
                }
                else {
                    process.send({ 
                        action: msg.action, 
                        payload: null, 
                        status: 'ok' 
                    })
                }
            });
        }
    }
    else {
        console.log('msg and msg.action required');
    }
    
});
