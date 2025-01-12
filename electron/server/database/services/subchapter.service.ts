import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { SubChapterCreateDto, SubChapterCreateResponse, SubChapterForGetAll, SubChapterRaw, SubChapterRawResponse } from "../../types/services/chapter.service";
import { DatabaseManager } from "../manager";

export default class SubChapterService {
    private instanceDb: InstanceDatabaseDoc | null = null;
    private allFields: SubChapterRaw = {
        id:             'id',
        pathName:       'path_name AS pathName',
        chapterId:      'chapter_id AS chapterId',
        fullpath:       'fullpath',
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
    private correctFieldsSqlForExclude(excludedFields?: Array<keyof SubChapterRaw>): string {
        let correctFieldsSql;
        if(excludedFields?.length! > 0) {
            correctFieldsSql = Object.entries(this.allFields).filter(([key, __]) => {
                if(!excludedFields!.includes(key as keyof SubChapterRaw)) return true;
                else return false;
            }).map(([__, value]) => value).join(',');
        }
        else correctFieldsSql = Object.values(this.allFields).join(',');
        return correctFieldsSql;
    }

    // Получить массив подразделов
    async getAll(config?: { excludes?: Array<keyof SubChapterRaw> }): Promise<Array<SubChapterForGetAll>> {
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes)
 
        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM sub_chapters;
        `);
        return rows.payload as Array<SubChapterForGetAll>;
    }

    // Найти подраздел по ID
    async findById(id: number, config?: { excludes?: Array<keyof SubChapterRaw> }): Promise<SubChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            const res = await this.instanceDb!.get(`
                SELECT ${correctFieldsSql}
                FROM sub_chapters
                WHERE id = ?;
            `, [id]);
            if (!res || !res?.payload) return null;
            return res.payload as SubChapterRawResponse;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Найти подраздел по pathName
    async findByPathName(pathName: string, config?: { excludes?: Array<keyof SubChapterRaw> }): Promise<SubChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            const res = await this.instanceDb!.get(`
                SELECT ${correctFieldsSql}
                FROM sub_chapters
                WHERE path_name = ?;
            `, [pathName]);
            if (!res || !res?.payload) return null;
            return res.payload as SubChapterRawResponse;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Найти подраздел по fullpath
    async findByFullpath(fullpath: string, config?: { excludes?: Array<keyof SubChapterRaw> }): Promise<SubChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            const res = await this.instanceDb!.get(`
                SELECT ${correctFieldsSql}
                FROM sub_chapters
                WHERE fullpath = ?;
            `, [fullpath]);
            if (!res || !res?.payload) return null;
            return res.payload as SubChapterRawResponse;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Создать один подраздел
    async create(dto: SubChapterCreateDto): Promise<SubChapterCreateResponse> {
        await this.instanceDb!.run(`
            INSERT INTO sub_chapters (
                path_name,
                fullpath,    
                chapter_id,
                icon,
                icon_type,
                chapter_type,
                label,
                route,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [
            dto.pathName,
            dto.fullpath,
            dto.chapterId,
            dto.icon,
            dto.iconType,
            dto.chapterType,
            dto.label,
            dto.route,
            dto.createdAt,
            dto.updatedAt,
        ]);
        const newSubChapter: SubChapterCreateResponse | null = await this.findByFullpath(dto.fullpath) as SubChapterCreateResponse;
        if(!newSubChapter) throw new Error('[SubChapterService.create]>> newSubChapter was not created');
        return newSubChapter;
    }
} 