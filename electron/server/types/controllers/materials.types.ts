
// Объект раздела при его создании на клиенте
export interface ChapterCreate {
    label: string;
    pathName: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string,
}

export interface SubChapterCreate {
    label: string;
    pathName: string;
    queryName: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string,
}

// Контент для каждого раздела и подраздела
export interface ChapterContent {
    title: string | null;
    blocks: Array<{
        id: number;
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
    }>;
}
export type IconType = 'pi' | 'mdi' | 'img';
export type ChapterType = 'file' | 'dir';

export interface SubChapter {
    id: number;
    queryName: string;
    pathName: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string;
    content: ChapterContent;
    items?: SubChapter[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface Chapter {
    id: number;
    pathName: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string;
    content: ChapterContent;
    items?: SubChapter[] | null;
    createdAt: string;
    updatedAt: string;
}