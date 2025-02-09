import { InstanceDatabaseDoc, IpcContractRes } from "../../types/database/index.types";
import { SubChapterCreateDto, SubChapterCreateResponse, SubChapterForGetAll, SubChapterGetByPathNameRes, SubChapterRaw, SubChapterRawResponse, SubChapterUpdateDto } from "../../types/services/chapter.service";
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
    private allFieldsForRec = {
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
    private correctFieldsSqlForExclude(excludedFields?: Array<keyof SubChapterRaw>): string {
        let correctFieldsSql;
        if (excludedFields?.length! > 0) {
            correctFieldsSql = Object.entries(this.allFields).filter(([key, __]) => {
                if (!excludedFields!.includes(key as keyof SubChapterRaw)) return true;
                else return false;
            }).map(([__, value]) => value).join(',');
        }
        else correctFieldsSql = Object.values(this.allFields).join(',');
        return correctFieldsSql;
    }

    // корректировка полей таблицы для выполнения записи данных sql
    private correctFieldsSqlForRec<T>(dto: T): { keys: string, args: any[] } {
        if (!dto || typeof dto !== 'object')
            throw new Error('[SubChapterService.correctFieldsSqlForRec]>> dto is not defined');
        const correctFieldsEntries = Object.entries(this.allFieldsForRec).filter(([key, __]) => {
            if (Object.prototype.hasOwnProperty.call(dto, key)) {
                return true;
            }
            else return false;
        })
        const args = correctFieldsEntries.map(([k, __]) => {
            return dto[k as keyof T];
        })
        return {
            keys: correctFieldsEntries.map(([__, val]) => val + ' = ?').join(', '),
            args,
        }
    }

    // region READ
    // Получить массив подразделов
    async getAll(config?: { excludes?: Array<keyof SubChapterRaw> }): Promise<Array<SubChapterForGetAll>> {
        let correctFieldsSql = this.correctFieldsSqlForExclude(config?.excludes)
 
        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM sub_chapters;
        `);
        return rows.payload as Array<SubChapterForGetAll>;
    }

    // Найти подраздел по ID
    async findById(
        id: number, 
        config?: { 
            select?: Array<keyof SubChapterRaw>,
            excludes?: Array<keyof SubChapterRaw>; 
            includes?: { blocks: boolean },
        }): Promise<SubChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            if(config?.select?.length && config?.select?.length > 0) {
                const excludesKeys = Object.keys(this.allFields).filter((key) => !config.select?.includes(key as keyof SubChapterRaw));
                correctFieldsSql = this.correctFieldsSqlForExclude(excludesKeys as Array<keyof SubChapterRaw>);
            }
            let res: IpcContractRes;
            if(config?.includes?.blocks === true) {
                res = await this.instanceDb!.get(`
                    SELECT 
                        sub_chapters.${this.allFields['id']}, sub_chapters.${this.allFields['pathName']},
                        sub_chapters.${this.allFields['contentTitle']}, sub_chapters.${this.allFields['createdAt']},
                        sub_chapters.${this.allFields['updatedAt']}, sub_chapters.${this.allFields['fullpath']},
                        sub_chapters.${this.allFields['icon']}, sub_chapters.${this.allFields['iconType']},
                        sub_chapters.${this.allFields['label']}, sub_chapters.${this.allFields['route']},
                        sub_chapters.${this.allFields['chapterType']},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'chapterId', blocks.sub_chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM sub_chapters
                    LEFT JOIN blocks
                    ON sub_chapters.id = blocks.sub_chapter_id
                    WHERE sub_chapters.id = ?
                    GROUP BY sub_chapters.id;
                `, [id]);
            }
            else {
                res = await this.instanceDb!.get(`
                    SELECT ${correctFieldsSql}
                    FROM sub_chapters WHERE path_name = ?;
                `, [id]);
            }
            if (!res || !res?.payload) return null;
            const data = res.payload as SubChapterRawResponse;
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

    // Найти подраздел по pathName
    async findByPathName(
        pathName: string, 
        config?: { 
            select?: Array<keyof SubChapterRaw>,
            excludes?: Array<keyof SubChapterRaw> 
        }): Promise<SubChapterRawResponse | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            if(config?.select?.length && config?.select?.length > 0) {
                const excludesKeys = Object.keys(this.allFields).filter((key) => !config.select?.includes(key as keyof SubChapterRaw));
                correctFieldsSql = this.correctFieldsSqlForExclude(excludesKeys as Array<keyof SubChapterRaw>);
            }
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
    async findByFullpath<T>(fullpath: string, config?: { 
        select?: Array<keyof SubChapterRaw>,
        excludes?: Array<keyof SubChapterRaw>,
        includes?: { blocks: boolean },
    }): Promise<SubChapterGetByPathNameRes | T | null> {
        try {
            let correctFieldsSql: string = this.correctFieldsSqlForExclude(config?.excludes);
            if(config?.select?.length && config?.select?.length > 0) {
                const excludesKeys = Object.keys(this.allFields).filter((key) => !config.select?.includes(key as keyof SubChapterRaw));
                correctFieldsSql = this.correctFieldsSqlForExclude(excludesKeys as Array<keyof SubChapterRaw>);
            }
            let res: IpcContractRes;
            if(config?.includes?.blocks === true) {
                res = await this.instanceDb!.get(`
                    SELECT 
                        sub_chapters.${this.allFields['id']}, sub_chapters.${this.allFields['pathName']},
                        sub_chapters.${this.allFields['fullpath']},
                        sub_chapters.${this.allFields['contentTitle']}, sub_chapters.${this.allFields['createdAt']},
                        sub_chapters.${this.allFields['updatedAt']},
                        sub_chapters.${this.allFields['icon']}, sub_chapters.${this.allFields['iconType']},
                        sub_chapters.${this.allFields['label']}, sub_chapters.${this.allFields['route']},
                        sub_chapters.${this.allFields['chapterType']},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'subChapterId', blocks.sub_chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM sub_chapters
                    LEFT JOIN blocks
                    ON sub_chapters.id = blocks.sub_chapter_id
                    WHERE sub_chapters.fullpath = ?
                    GROUP BY sub_chapters.id;
                `, [fullpath]);
            }
            else {
                res = await this.instanceDb!.get(`
                    SELECT ${correctFieldsSql}
                    FROM sub_chapters WHERE fullpath = ?;
                `, [fullpath]);
            }
            if (!res! || !res?.payload) return null;
            return res.payload as SubChapterGetByPathNameRes;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    //end region

    // region CREATE
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
        if (!newSubChapter) throw new Error('[SubChapterService.create]>> newSubChapter was not created');
        return newSubChapter;
    }
    // end region

    // region UPDATE
    // Обновление данных ПОДраздела
    async update(id: number, dto: SubChapterUpdateDto): Promise<SubChapterRawResponse> {
        if (!id) throw new Error('[SubChapterService.update]>> id is not defined');
        const { args, keys } = this.correctFieldsSqlForRec<SubChapterUpdateDto>(dto);
        await this.instanceDb!.run(`
                UPDATE sub_chapters
                SET
                    ${keys}
                WHERE id = ?;
            `, [...args, id]);
        const updatedSubChapter: SubChapterRawResponse | null = await this.findById(id, { 
            includes: {
                blocks: true,
            }
        }) as SubChapterRawResponse;
        if (!updatedSubChapter) throw new Error('[SubChapterService.update]>> subChapter was not updated');
        return updatedSubChapter;
    }
    // end region

    // region DELETE
    async deleteOneByFullpath(fullpath: string): Promise<void> {
        if(!fullpath) throw new Error('[SubChapterService.deleteOneByFullpath]>> fullpath is not defined');
        await this.instanceDb!.run(`
            DELETE FROM sub_chapters 
            WHERE fullpath LIKE ? || '%';
        `, [fullpath]);
        return void 0;
    }
    // end region
} 