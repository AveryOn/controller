import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { ChapterForGetAll, ChapterRaw } from "../../types/services/chapter.service";
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

    // Получить массив разделов
    async getAll(config?: { excludes?: Array<keyof ChapterRaw> }): Promise<Array<ChapterForGetAll>> {
        let correctFieldsSql;
        if(config?.excludes?.length! > 0) {
            correctFieldsSql = Object.entries(this.allFields).filter(([key, __]) => {
                if(!config?.excludes!.includes(key as keyof ChapterRaw)) return true;
                else return false;
            }).map(([__, value]) => value).join(',');
        }
        else correctFieldsSql = Object.values(this.allFields).join(',');
        const rows = await this.instanceDb!.all(`
            SELECT ${correctFieldsSql} FROM chapters;
        `);
        return rows.payload as Array<ChapterForGetAll>;
    }
} 