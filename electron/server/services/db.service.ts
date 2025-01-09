// Сервис для менеджмента баз данных

import { ChildProcess } from "child_process";
import { initDB } from "./sqlite.service";
import { DatabaseErrorIpcDto, DatabaseIpcDto } from "../types/services/db.service.types";

const processContracts = {
    materials: {
        migrations: {
            initChaptersTable: 'db:materials-mgs-init-chapters-table',
            initSubChaptersTable: 'db:materials-mgs-init-sub-chapters-table',
            initBlocksTable: 'db:materials-mgs-init-blocks-table',
        }
    }
}

// Применить миграции для БД материалов
async function executeMigrations(process: ChildProcess, dbname: keyof typeof processContracts): Promise<number> {
    return new Promise((resolve, reject) => {
        let actionStack = Object.values(processContracts[dbname].migrations);
        let migrationAmount = actionStack.length;
        
        process.on('message', (msg: DatabaseIpcDto | DatabaseErrorIpcDto) => {
            console.log(msg);
            if(actionStack.includes(msg.action)) {
                if(msg.status === 'ok') {
                    actionStack = actionStack.filter((action) => action !== msg.action);
                    if(actionStack.length <= 0) {
                        process.removeAllListeners()
                        console.log('RESOLVE', migrationAmount);
                        resolve(migrationAmount);
                    }
                }
                else if(msg.status === 'error') reject(msg.payload.msg);
            }
        });
        for (const action of actionStack) { // Вызов миграций
            if(action) process.send({ 
                action,
                payload: { namespace: dbname },
            } as DatabaseIpcDto); 
        }

        process.on('error', (err) => {
            console.error(`[executeMigrations (${dbname})]>>`, err);
            throw err;
        });
    });
}

// Инициализация пользовательских баз данных
export async function initUserDataBases(username: string) {
    try {
        const materialsProcess = await initDB('MATERIALS_DB_NAME', username);
        const migrations = await executeMigrations(materialsProcess, 'materials');
        console.log('Миграции выполнены', migrations);
    } catch (err) {
        throw err;
    }
}