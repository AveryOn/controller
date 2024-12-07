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
    pathName: string;
    label: string;
    fullpath: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string,
}

export interface GetChaptersConfig extends PaginatorParams {
    forMenu?: boolean;
}

export interface GetChapterOneParams {
    chapterId?: number;
    pathName?: string;
}

export interface GetSubChapterOneParams {
    pathName: string;
    fullpath: string;
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

export interface EditChapterBlock {
    pathName: string;
    fullpath?: string;
    block: ChapterBlock;
}

export interface ChapterBlock {
    id: number;
    title: string;
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
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: SubChapter[] | null;
}

export interface ChapterForMenu {
    id: number;
    pathName?: string;
    fullpath?: string;
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: ChapterForMenu[] | null;
}