import pkg from 'sqlite3';
const { verbose } = pkg;

function initDB(dbpath) {
    const sqlite3 = verbose();
    return new sqlite3.Database(dbpath);
}

process.on("message", (msg) => {
    if(!msg) process.emit('uncaughtException', { status: 'error', msg: 'msg is required argument' }) 
        // process.send({ action: "db:init", status: 'error', payload: { msg: 'msg is required argument' } })
        
    // Отправляем сообщение обратно в родительский процесс
    if (msg.action === "db:init") {
        const db = initDB(msg.payload.dbpath);
        process.send({
            action: "db:init",
            status: 'ok',
            payload: {  }
        });
    }
});
