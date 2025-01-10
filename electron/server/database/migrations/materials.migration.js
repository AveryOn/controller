const createChaptersTable = `
    CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY,
        path_name TEXT NOT NULL,
        icon TEXT NOT NULL,
        icon_type TEXT NOT NULL,
        chapter_type TEXT NOT NULL,
        label TEXT NOT NULL,
        route TEXT NOT NULL,
        content_title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
`
const createSubChaptersTable = `
    CREATE TABLE IF NOT EXISTS sub_chapters (
        id INTEGER PRIMARY KEY,
        fullpath TEXT NOT NULL,
        path_name TEXT NOT NULL,
        chapter_id INTEGER NOT NULL,
        icon TEXT NOT NULL,
        icon_type TEXT NOT NULL,
        chapter_type TEXT NOT NULL,
        label TEXT NOT NULL,
        route TEXT NOT NULL,
        content_title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    );
`
const createBlockTable = `
    CREATE TABLE IF NOT EXISTS blocks (
        id INTEGER PRIMARY KEY,
        chapter_id INTEGER,
        sub_chapter_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id),
        FOREIGN KEY (sub_chapter_id) REFERENCES sub_chapters(id)
    );
`

export default [
    createChaptersTable,
    createSubChaptersTable,
    createBlockTable,
]