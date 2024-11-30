
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

export interface ChapterEdit {
    fullpath?: string;
    label?: string;
    pathName?: string;
    icon?: string;
    iconType?: IconType;
    chapterType?: ChapterType;
    route?: string,
}

export interface ChapterEditRequest {
    pathName?: string;
    fullpath?: string;
    params: {
        label?: string;
        pathName?: string;
        icon?: string;
        iconType?: IconType;
        chapterType?: ChapterType;
        route?: string,
    }
}

export interface DeleteChapterParams {
    chapterId?: number;
    pathName?: string;
}

// Контент для каждого раздела и подраздела
export interface ChapterContent {
    title: string;
    blocks: Array<{
        id: number;
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
    }>;
}

export type IconMode = 'img' | 'sym' | 'svg' | string;
export type IconType = 'pi' | 'mdi' | 'img';
export type ChapterType = 'file' | 'dir' | string;

export interface SubChapter {
    id: number;
    fullpath: string;
    label: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string;
    content: ChapterContent;
    items?: SubChapter[];
    createdAt: string;
    updatedAt: string;
}

export interface Chapter {
    id: number;
    pathName?: string;
    fullpath?: string;
    label: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string;
    content: ChapterContent;
    items?: SubChapter[];
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
    fullpath?: string;
    icon: string;
    iconType: IconType;
    label: string;
    route: string;
    items?: SubChapterForMenu[] | null;
}

// addChapter.vue
export interface ModesIcon {
    name: string;
    value: IconMode;
}
export interface ChapterTypes {
    name: string;
    value: ChapterType;
}
export interface IconTypes {
    name: string;
    value: IconType;
}

export interface CreateChapterForm {
    label: string;
    pathName: string;
    symbol: string;
    iconType: IconType;
    iconImg: any;
    type: ChapterType;
}

export interface CreateSubChapterForm {
    chapterId: number;
    label: string;
    fullpath: string;
    icon: string;
    iconType: IconType;
    chapterType: ChapterType;
    route: string,
}

export interface GetChaptersParams {
    page?: number;
    perPage?: number;
    forMenu?: boolean;
}

export interface GetOneChapterParams {
    chapterId?: number;
    pathName?: string;
}

export interface GetOneSubChapterParams {
    pathName: string;
    fullpath: string;
}