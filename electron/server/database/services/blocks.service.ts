import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { BlockRaw, BlockForGetAll } from "../../types/services/blocks.service";
import { DatabaseManager } from "../manager";

export default class BlocksService {
    private instanceDb: InstanceDatabaseDoc | null = null;
    private allFields: BlockRaw = {
        id:             'id',
        chapterId:      'chapter_id AS chapterId',
        subChapterId:   'sub_chapter_id AS subChapterId',
        title:          'title',
        content:        'content',
        createdAt:      'created_at AS createdAt',
        updatedAt:      'updated_at AS updatedAt',
    }
    private allFieldsForRec = {
        chapterId:      'chapter_id AS chapterId',
        subChapterId:   'sub_chapter_id AS subChapterId',
        title:          'title',
        content:        'content',
        updatedAt:      'updated_at AS updatedAt',
    }

    constructor() {
        this.instanceDb = DatabaseManager
            .instance()
            .getDatabase('materials');
        if(!this.instanceDb) throw new Error('DB materials is not initialized');
    }

    // коррекция полей таблицы. Исключает те поля которые приходят в массиве
    private correctFieldsSqlForExclude(excludedFields?: Array<keyof BlockRaw>): string {
        let correctFieldsSql;
        if(excludedFields?.length! > 0) {
            correctFieldsSql = Object.entries(this.allFields).filter(([key, __]) => {
                if(!excludedFields!.includes(key as keyof BlockRaw)) return true;
                else return false;
            }).map(([__, value]) => value).join(',');
        }
        else correctFieldsSql = Object.values(this.allFields).join(',');
        return correctFieldsSql;
    }

    // корректировка полей таблицы для выполнения записи данных sql
    private correctFieldsSqlForRec<T>(dto: T): { keys: string, args: any[] } {
        if(!dto || typeof dto !== 'object') 
            throw new Error('[BlocksService.correctFieldsSqlForRec]>> dto is not defined');
        const correctFieldsEntries = Object.entries(this.allFieldsForRec).filter(([key, __]) => {
            if(Object.prototype.hasOwnProperty.call(dto, key)) {
                return true;
            }
            else return false;
        })
        const args = correctFieldsEntries.map(([k, __]) => {
            return dto[k as keyof T]
        })
        return {
            keys: correctFieldsEntries.map(([__, val]) => val + ' = ?').join(', '),
            args,
        }
    }

    // region READ
    // Получить массив блоков для раздела
    async getAllForChapter(chapterId: number, config?: { excludes?: Array<keyof BlockRaw> }): Promise<Array<BlockForGetAll>> {
        if(!chapterId) throw new Error('[BlocksService.getAllForChapter]>> chapterId is not defined');
        
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes);

        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM blocks
            WHERE chapter_id = ?;
        `, [chapterId]);
        return rows.payload as Array<BlockForGetAll>;
    }

    // Получить массив блоков для подраздела
    async getAllForSubChapter(chapterId: number, config?: { excludes?: Array<keyof BlockRaw> }): Promise<Array<BlockForGetAll>> {
        if(!chapterId) throw new Error('[BlocksService.getAllForSubChapter]>> chapterId is not defined');
        
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes);

        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM blocks
            WHERE sub_chapter_id = ?;
        `, [chapterId]);
        return rows.payload as Array<BlockForGetAll>;
    }
    // end region
} 