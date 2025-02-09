import { formatDate } from "../../services/date.service";
import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { BlockRaw, BlockForGet, CreateBlockDto, GetBlockByTitle } from "../../types/services/blocks.service";
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
        chapterId:      'chapter_id',
        subChapterId:   'sub_chapter_id',
        title:          'title',
        content:        'content',
        updatedAt:      'updated_at',
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
    async getAllForChapter(chapterId: number, config?: { excludes?: Array<keyof BlockRaw> }): Promise<Array<BlockForGet>> {
        if(!chapterId) throw new Error('[BlocksService.getAllForChapter]>> chapterId is not defined');
        if(typeof chapterId !== 'number' || Object.is(+chapterId, NaN)) throw new Error('[BlocksService.getAllForChapter]>> invalid chapterId');
        
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes);
        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM blocks 
            WHERE chapter_id = ${chapterId};
            `, []);
        return rows.payload as Array<BlockForGet>;
    }

    // Получить массив блоков для подраздела
    async getAllForSubChapter(chapterId: number, config?: { excludes?: Array<keyof BlockRaw> }): Promise<Array<BlockForGet>> {
        if(!chapterId) throw new Error('[BlocksService.getAllForSubChapter]>> chapterId is not defined');
        if(typeof chapterId !== 'number' || Object.is(+chapterId, NaN)) throw new Error('[BlocksService.getAllForSubChapter]>> invalid chapterId');

        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes);

        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM blocks
            WHERE sub_chapter_id = ${chapterId};
        `, []);
        return rows.payload as Array<BlockForGet>;
    }

    // Получить раздел по title 
    async getByTitle(
        dto: GetBlockByTitle, 
        config?: { 
            select?: Array<keyof BlockRaw>,
            excludes?: Array<keyof BlockRaw> 
        }): Promise<BlockForGet | null> {
        if(!dto.title) throw new Error('[BlocksService.getByTitle]>> title is not defined');
        if(!dto.chapterId && !dto.subChapterId) throw new Error('[BlocksService.getByTitle]>> either chapterId or subChapterId must be transmitted');

        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes);
        if(config?.select?.length && config?.select?.length > 0) {
            const excludesKeys = Object.keys(this.allFields).filter((key) => !config.select?.includes(key as keyof BlockRaw));
            correctFieldsSql = this.correctFieldsSqlForExclude(excludesKeys as Array<keyof BlockRaw>);
        }
        let sql: string | null = null;
        let args: any[] = []; 
        if(dto.chapterId) {
            sql = `
                SELECT ${correctFieldsSql} FROM blocks
                WHERE chapter_id = ? AND title = ?;
            `;
            args = [dto.chapterId, dto.title];
        }
        else if (dto.subChapterId) {
            sql = `
                SELECT ${correctFieldsSql} FROM blocks
                WHERE sub_chapter_id = ? AND title = ?;
            `;
            args = [dto.subChapterId, dto.title];
        }
        if(sql) {
            const res = await this.instanceDb!.get(sql, args);
            if (!res || !res?.payload) return null;
            return res.payload as BlockForGet;
        }
        else throw new Error('[BlocksService.getByTitle]>> INTERNAL ERROR');

    }
    // end region

    // region CREATE
    // Создать блок для раздела
    async createForChapter(dto: CreateBlockDto) {
        await this.instanceDb!.run(`
            INSERT INTO blocks (
                chapter_id,
                sub_chapter_id,
                title,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?);
        `, [
            dto.chapterId,
            dto.subChapterId,
            dto.title,
            formatDate(),
            formatDate(),
        ]);
        const newBlock: BlockForGet | null = await this.getByTitle({ 
            title: dto.title, 
            chapterId: dto.chapterId, 
            subChapterId: dto.subChapterId 
        }) as BlockForGet;
        if(!newBlock) throw new Error('[BlocksService.createForChapter]>> newBlock was not created');
        return newBlock;
    }
    // end region
} 