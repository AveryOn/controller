import pkg from 'sqlite3';
const { Database } = pkg


export default class MaterialsMigrations {
    instance = null;
    dbname = process.env.MATERIALS_DB_NAME || 'materials';
    chapterTableName = 'chapters';
    constructor() {
        if(!this.instance) {
            this.instance = this;
        }
        return this.instance;
    }

    // инициализация таблицы разделов
    async initChaptersTable(db) {
        if(!db || !(db instanceof Database)) throw new Error('invalid DataBase instance');
        return new Promise((luck, fuck) => {
            db.run(`
                CREATE TABLE IF NOT EXISTS ${this.chapterTableName} (
                    id INTEGER PRIMARY KEY,
                    pathName TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    iconType: TEXT NOT NULL,
                    chapterType: TEXT NOT NULL, -- file | dir
                    label: TEXT NOT NULL,
                    route: TEXT NOT NULL,
                    contentTitle: TEXT NOT NULL,
                    createdAt: TEXT NOT NULL,
                    updatedAt: TEXT NOT NULL,
                );
            `, (err) => {
                console.error('[migrations > materials > initChaptersTable]', err);
                if(err) fuck(err);
                else luck(null);
            })
        })
    }

}
