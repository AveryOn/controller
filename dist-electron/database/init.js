import sqlite3Pkg  from '@journeyapps/sqlcipher';
import materialsMigration from './migrations/materials.migration.js';
import usersMigration from './migrations/users.migration.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = {
    "migrate:materials": materialsMigration,
    "migrate:users": usersMigration,
}

let db = null;
process.on("message", async (msg) => {
    
    if(msg && msg.action) {
        
        if(!msg?.payload?.pragmaKey) {
            const msgErr = 'pragmaKey is not defined!'
            process.send({ action: msg.action, payload: new Error(msgErr), status: 'error' });
            throw new Error(msgErr);
        }
        // инициализация базы данных
        if(msg.action.includes('init')) {
            if(!msg.payload?.dbpath) throw new Error('dbpath is a required')
            const sqlite3 = sqlite3Pkg.verbose();
            db = new sqlite3.Database(msg?.payload?.dbpath, (err) => {
                if(err) {
                    console.log(err);
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
        // Запуск миграций
        if(msg.action.includes('migrate:')) {
            Object.keys(migrations).forEach((key) => {
                if(msg.action.includes(key)) {
                    const migrateList = migrations[key];
                    if(Array.isArray(migrateList)) {
                        db.serialize(async () => {
                            db.run(`PRAGMA key = '${ msg.payload.pragmaKey }';`); // Установка пароля
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
                        });
                    }
                }
            })
        }
        // для all запросов 
        if(msg.action.includes('all')) {
            db.serialize(async () => {
                db.run(`PRAGMA key = '${ msg.payload.pragmaKey }';`);
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
            })
        }
        // для get запросов
        if(msg.action.includes('get')) {
            db.serialize(async () => {
                db.run(`PRAGMA key = '${ msg.payload.pragmaKey }';`);
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
            })
        }
        // для run запросов
        if(msg.action.includes('run')) {
            db.serialize(async () => {
                db.run(`PRAGMA key = '${ msg.payload.pragmaKey }';`);
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
            })
        }
        // для exec запросов
        if(msg.action.includes('exec')) {
            db.serialize(async () => {
                db.run(`PRAGMA key = '${ msg.payload.pragmaKey }';`);
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
            })
        }
    }
    else {
        console.log('msg and msg.action required');
    }
    
});
