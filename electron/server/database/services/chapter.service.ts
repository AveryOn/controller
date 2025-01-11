import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { ChapterCreateDto, ChapterCreateResponse, ChapterForGetAll, ChapterRaw, ChapterRawResponse } from "../../types/services/chapter.service";
import { DatabaseManager } from "../manager";

export default class ChapterService {
    private instanceDb: InstanceDatabaseDoc | null = null;
    private allFields: ChapterRaw = {
        id:             'id',
        pathName:       'path_name AS pathName',
        icon:           'icon',
        iconType:       'icon_type AS iconType',
        chapterType:    'chapter_type AS chapterType',
        label:          'label',
        route:          'route',
        contentTitle:   'content_title AS contentTitle',
        createdAt:      'created_at AS createdAt',
        updatedAt:      'updated_at AS updatedAt',
    }

    constructor() {
        this.instanceDb = DatabaseManager
            .instance()
            .getDatabase('materials');
        if(!this.instanceDb) throw new Error('DB materials is not initialized');
    }

    // коррекция полей таблицы. Исключает те поля которые приходят в массиве
    private correctFieldsSqlForExclude(excludedFields?: Array<keyof ChapterRaw>): string {
        let correctFieldsSql;
        if(excludedFields?.length! > 0) {
            correctFieldsSql = Object.entries(this.allFields).filter(([key, __]) => {
                if(!excludedFields!.includes(key as keyof ChapterRaw)) return true;
                else return false;
            }).map(([__, value]) => value).join(',');
        }
        else correctFieldsSql = Object.values(this.allFields).join(',');
        return correctFieldsSql;
    }

    // Получить массив разделов
    async getAll(config?: { excludes?: Array<keyof ChapterRaw> }): Promise<Array<ChapterForGetAll>> {
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes)
 
        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM chapters;
        `);
        return rows.payload as Array<ChapterForGetAll>;
    }

    // Найти раздел по ID
    async findById(id: number, config?: { excludes?: Array<keyof ChapterRaw> }): Promise<ChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            const res = await this.instanceDb!.get(`
                SELECT ${correctFieldsSql}
                FROM chapters
                WHERE id = ?;
            `, [id]);
            if (!res || !res?.payload) return null;
            return res.payload as ChapterRaw;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Найти раздел по pathName
    async findByPathName(pathName: string, config?: { excludes?: Array<keyof ChapterRaw> }): Promise<ChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            const res = await this.instanceDb!.get(`
                SELECT ${correctFieldsSql}
                FROM chapters
                WHERE path_name = ?;
            `, [pathName]);
            if (!res || !res?.payload) return null;
            return res.payload as ChapterRaw;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Создать один раздел
    async create(dto: ChapterCreateDto): Promise<ChapterCreateResponse> {
        await this.instanceDb!.run(`
            INSERT INTO chapters (
                path_name,
                icon,
                icon_type,
                chapter_type,
                label,
                route,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
            dto.pathName,
            dto.icon,
            dto.iconType,
            dto.chapterType,
            dto.label,
            dto.route,
            dto.createdAt,
            dto.updatedAt,
        ]);
        const newChapter: ChapterCreateResponse | null = await this.findByPathName(dto.pathName) as ChapterCreateResponse;
        if(!newChapter) throw new Error('[ChapterService.create]>> newChapter was not created');
        return newChapter;
    }
} 