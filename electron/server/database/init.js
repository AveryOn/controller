import pkg from 'sqlite3';
const { verbose, Database } = pkg;
import MaterialsMigrations from '../database/migrations/materials.migration.js';


const processContracts = {
    materials: {
        migrations: {
            initChaptersTable: 'db:materials-mgs-init-chapters-table',
            initSubChaptersTable: 'db:materials-mgs-init-sub-chapters-table',
            initBlocksTable: 'db:materials-mgs-init-blocks-table',
        }
    }
}

function initDB(dbpath) {
    return new Promise((resolve, reject) => {
        const sqlite3 = verbose();
        return new sqlite3.Database(dbpath);
    })
}

let db;
process.on("message", async (msg) => {
    if(!msg) process.emit('uncaughtException', { status: 'error', msg: 'msg is required argument' }) 
    if(!msg?.action) throw 'invalid msg action'

    // Отправляем сообщение обратно в родительский процесс
    if (msg.action === "db:init") {
        db = await initDB(msg.payload.dbpath);
        
        process.send({
            action: "db:init",
            status: 'ok',
            payload: {  }
        });
    }

    if(!(db instanceof Database)) {
        console.log('DB IS NONE');
        return;
    }
    // Взаимодействие с БД материалов
    if(msg?.payload?.namespace === 'materials') {
        const migrationsMaterials = new MaterialsMigrations();
        const migrationsMaterialsActions = Object.values(processContracts.materials.migrations);

        if(migrationsMaterialsActions.includes(msg.action)) {
            const initChapterTable = processContracts.materials.migrations.initChaptersTable;
            const initSubChapterTable = processContracts.materials.migrations.initSubChaptersTable;
            const initBlocksTable = processContracts.materials.migrations.initBlocksTable;

            // Создание таблицы разделов
            if(msg.action === initChapterTable) {
                await migrationsMaterials.initChaptersTable(db)
                process.send({ action: initChapterTable, payload: {}, status: 'ok' })
            }
            // Создание таблицы подразделов
            if(msg.action === initSubChapterTable) {
                process.send({ action: initSubChapterTable, payload: {}, status: 'ok' })
            }
            // Создание таблицы блоков
            if(msg.action === initBlocksTable) {
                process.send({ action: initBlocksTable, payload: {}, status: 'ok' })
            }
        }
    }
});
