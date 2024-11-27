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
    label: string;
    pathName: string;
    queryName: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string,
}

export interface GetChaptersConfig extends PaginatorParams {}

export interface GetChapterOneParams {
    chapterId?: number;
    pathName?: string;
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
    queryName: string;
    pathName: string;
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: SubChapter[] | null;
}

export interface ChapterForMenu {
    id: number;
    pathName: string;
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: SubChapterForMenu[] | null;
}