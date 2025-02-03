import { Chapter } from "../../types/controllers/materials.types";
import { InstanceDatabaseDoc, IpcContractRes } from "../../types/database/index.types";
import { ChapterCreateDto, ChapterCreateResponse, ChapterForGetAll, ChapterGetByPathNameRes, ChapterRaw, ChapterRawResponse, ChapterUpdateDto } from "../../types/services/chapter.service";
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
    private allFieldsForRec = {
        pathName:       'path_name',
        icon:           'icon',
        iconType:       'icon_type',
        chapterType:    'chapter_type',
        label:          'label',
        contentTitle:   'content_title',
        updatedAt:      'updated_at',
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

    // корректировка полей таблицы для выполнения записи данных sql
    private correctFieldsSqlForRec<T>(dto: T): { keys: string, args: any[] } {
        if(!dto || typeof dto !== 'object') 
            throw new Error('[ChapterService.correctFieldsSqlForRec]>> dto is not defined');
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
    // Получить массив разделов
    async getAll(config?: { excludes?: Array<keyof ChapterRaw> }): Promise<Array<ChapterForGetAll>> {
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes)
 
        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM chapters;
        `);
        return rows.payload as Array<ChapterForGetAll>;
    }

    // Получить массив разделов с их подразделами для формирования массива для панели меню
    async getAllForMenu() {
        const res = await this.instanceDb!.all(`
            SELECT 
                chapters.${this.allFields['id']}, chapters.${this.allFields['pathName']},
                chapters.${this.allFields['icon']}, chapters.${this.allFields['iconType']},
                chapters.${this.allFields['label']}, chapters.${this.allFields['route']},
                chapters.${this.allFields['chapterType']},
                JSON_GROUP_ARRAY(
                    JSON_OBJECT(
                        'id', sub_chapters.id,
                        'fullpath', sub_chapters.fullpath,
                        'chapterType', sub_chapters.chapter_type,
                        'icon', sub_chapters.icon,
                        'iconType', sub_chapters.icon_type,
                        'label', sub_chapters.label,
                        'route', sub_chapters.route
                    )
                ) AS items
            FROM chapters
            LEFT JOIN sub_chapters
            ON chapters.id = sub_chapters.chapter_id
            GROUP BY chapters.id;
        `)
        if (!res || !res?.payload) return null;
        return res.payload;
    }

    // Найти раздел по ID
    async findById(
        id: number, 
        config?: { 
            excludes?: Array<keyof ChapterRaw>; 
            includes?: { blocks: boolean },
        }): Promise<ChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            let res: IpcContractRes;
            if(config?.includes?.blocks === true) {
                res = await this.instanceDb!.get(`
                    SELECT 
                        chapters.${this.allFields['id']}, chapters.${this.allFields['pathName']},
                        chapters.${this.allFields['contentTitle']}, chapters.${this.allFields['createdAt']},
                        chapters.${this.allFields['updatedAt']},
                        chapters.${this.allFields['icon']}, chapters.${this.allFields['iconType']},
                        chapters.${this.allFields['label']}, chapters.${this.allFields['route']},
                        chapters.${this.allFields['chapterType']},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'chapterId', blocks.chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM chapters
                    LEFT JOIN blocks
                    ON chapters.id = blocks.chapter_id
                    WHERE chapters.id = ?
                    GROUP BY chapters.id;
                `, [id]);
            }
            else {
                res = await this.instanceDb!.get(`
                    SELECT ${correctFieldsSql}
                    FROM chapters WHERE path_name = ?;
                `, [id]);
            }
            if (!res || !res?.payload) return null;
            const data = res.payload as ChapterRawResponse;
            if(data.blocks && typeof data.blocks === 'string') {
                data.blocks = JSON.parse(data.blocks) as any[];
                data.blocks = !!data.blocks[0]?.id ? data.blocks : [];
            }
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Найти раздел по pathName
    async findByPathName<T>(pathName: string, config?: { 
        excludes?: Array<keyof ChapterRaw>, 
        includes?: { blocks: boolean },
    }): Promise<ChapterGetByPathNameRes | T | null> {

        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            let res: IpcContractRes;
            if(config?.includes?.blocks === true) {
                res = await this.instanceDb!.get(`
                    SELECT 
                        chapters.${this.allFields['id']}, chapters.${this.allFields['pathName']},
                        chapters.${this.allFields['contentTitle']}, chapters.${this.allFields['createdAt']},
                        chapters.${this.allFields['updatedAt']},
                        chapters.${this.allFields['icon']}, chapters.${this.allFields['iconType']},
                        chapters.${this.allFields['label']}, chapters.${this.allFields['route']},
                        chapters.${this.allFields['chapterType']},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'chapterId', blocks.chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM chapters
                    LEFT JOIN blocks
                    ON chapters.id = blocks.chapter_id
                    WHERE chapters.path_name = ?
                    GROUP BY chapters.id;
                `, [pathName]);
            }
            else {
                res = await this.instanceDb!.get(`
                    SELECT ${correctFieldsSql}
                    FROM chapters WHERE path_name = ?;
                `, [pathName]);
            }
            if (!res! || !res?.payload) return null;
            return res.payload as ChapterGetByPathNameRes;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    // end region

    // region CREATE
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
        const newChapter: ChapterCreateResponse | null = await this.findByPathName<ChapterCreateResponse>(dto.pathName) as ChapterCreateResponse;
        if(!newChapter) throw new Error('[ChapterService.create]>> newChapter was not created');
        return newChapter;
    }
    // end region

    // region UPDATE
    // Обновление данных раздела
    async update(id: number, dto: ChapterUpdateDto): Promise<ChapterRawResponse> {
        if(!id) throw new Error('[ChapterService.updateByPathName]>> id is not defined');
        const { args, keys } = this.correctFieldsSqlForRec<ChapterUpdateDto>(dto);
        await this.instanceDb!.run(`
            UPDATE chapters
            SET
                ${keys}
            WHERE id = ?;
        `, [...args, id]);
        const newChapter: ChapterRawResponse | null = await this.findById(id, { 
            includes: { 
                blocks: true 
            } 
        }) as ChapterRawResponse;
        if(!newChapter) throw new Error('[ChapterService.updateByPathName]>> newChapter was not created');
        return newChapter;
    }
    // end region

    // region DELETE
    // Удаление раздела по pathName
    async deleteOneByPathName(pathName: string): Promise<void> {
        if(!pathName) throw new Error('[ChapterService.deleteOneByPathName]>> pathName is not defined');
        // удалить все подразделы текущего раздела
        await this.instanceDb!.run(`
            DELETE FROM sub_chapters 
            WHERE path_name = ?;
        `, [pathName]);
        // удалить текущий раздел
        await this.instanceDb!.run(`
            DELETE FROM chapters
            WHERE path_name = ?;
        `, [pathName]);
        return void 0;
    }
    // end region
} 