import { PaginatorParams } from "./index.types";

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
    chapterId: number;
    pathName: string;
    label: string;
    fullpath: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string,
}

export interface GetChaptersConfig extends PaginatorParams {
    token: string;
    forMenu?: boolean;
}

export interface GetChapterOneParams {
    chapterId?: number;
    pathName?: string;
}

export interface GetSubChapterOneParams {
    pathName: string;
    fullpath: string;
    // labels: string;
}

// Данные приходят с запросом на редактирование раздела/подраздела
export interface EditChapterParams {
    pathName?: string;
    fullpath?: string;
    params: {
        label?: string;
        pathName?: string;
        icon?: string;
        iconType?: IconType;
        chapterType?: ChapterType;
    }
}

// Параметры для удаления раздела
export interface DeleteChapterParams {
    chapterId?: number;
    pathName?: string;
}
// Параметры для удаления ПОДраздела
export interface DeleteSubChapterParams {
    fullpath: string;
}

export type DeleteResponseMessage = 'success' | 'failed';

export interface CreateChapterBlock {
    pathName: string;
    fullpath?: string;
    title: string;
}

export interface DeleteChapterBlock {
    pathName: string;
    fullpath?: string;
    blockId: number;
}
export interface EditChapterBlock {
    pathName: string;
    fullpath?: string;
    block: ChapterBlock;
}

export interface EditChapterBlockTitle {
    pathName: string;
    fullpath?: string;
    blockId: number;
    blockTitle: string;
}

export interface ChapterBlock {
    id: number;
    title: string;
    chapterId?: number;
    subChapterId?: number;
    content: string | null;
    createdAt: string;
    updatedAt: string;
} 

// Контент для каждого раздела и подраздела
export interface ChapterContent {
    title: string | null;
    blocks: Array<ChapterBlock>;
}
export type IconType = 'pi' | 'mdi' | 'img';
export type ChapterType = 'file' | 'dir';

export interface SubChapter {
    id: number;
    fullpath: string;
    pathName?: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    label: string;
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
    label: string;
    route: string;
    content: ChapterContent;
    items?: SubChapter[] | null;
    createdAt: string;
    updatedAt: string;
}

export interface SubChapterForMenu {
    id: number;
    fullpath: string;
    pathName?: string;
    chapterType: 'dir' | 'file';
    fullLabels: string[];
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: SubChapterForMenu[] | null;
}

export interface ChapterForMenu {
    id: number;
    pathName: string;
    fullpath?: string;
    chapterType: 'dir' | 'file';
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: SubChapterForMenu[] | null;
}