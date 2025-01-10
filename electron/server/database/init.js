import pkg from 'sqlite3';
const { verbose, Database } = pkg;

let db = null;
process.on("message", async (msg) => {
    
    if(msg && msg.action) {
        // инициализация базы данных
        if(msg.action.includes('init')) {
            if(!msg.payload?.dbpath) throw new Error('dbpath is a required')
            const sqlite3 = verbose();
            db = new sqlite3.Database(msg?.payload?.dbpath, (err) => {
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
            db.get(msg.payload.sql, (err, row) => {
                if(err) {
                    process.send({ action: msg.action, payload: err, status: 'error' });
                }
                else {
                    process.send({ 
                        action: msg.action, 
                        payload: row ?? null, 
                        status: 'ok' 
                    })
                }
            });
        }
        // для run запросов
        if(msg.action.includes('run')) {
            db.run(msg.payload.sql, (err) => {
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
        // для exec запросов
        if(msg.action.includes('exec')) {
            db.exec(msg.payload.sql, (err) => {
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
