
export interface ChapterRaw { 
    id:             string;
    pathName:       string;
    icon:           string;
    iconType:       string;
    chapterType:    string;
    label:          string;
    route:          string;
    contentTitle:   string;
    createdAt:      string;
    updatedAt:      string;
}
export interface SubChapterRaw { 
    id:             string;
    pathName:       string;
    fullpath:       string;
    chapterId:      string;
    icon:           string;
    iconType:       string;
    chapterType:    string;
    label:          string;
    route:          string;
    contentTitle:   string;
    createdAt:      string;
    updatedAt:      string;
}

export interface ChapterRawResponse {
    id?:             string;
    pathName?:       string;
    icon?:           string;
    iconType?:       string;
    chapterType?:    string;
    label?:          string;
    route?:          string;
    contentTitle?:   string;
    createdAt?:      string;
    updatedAt?:      string;
}

export interface SubChapterRawResponse {
    id?:             string;
    pathName?:       string;
    fullpath?:       string;
    chapterId?:      string;
    icon?:           string;
    iconType?:       string;
    chapterType?:    string;
    label?:          string;
    route?:          string;
    contentTitle?:   string;
    createdAt?:      string;
    updatedAt?:      string;
}

export interface ChapterForGetAll {
    id?:             string;
    pathName?:       string;
    icon?:           string;
    iconType?:       string;
    chapterType?:    string;
    label?:          string;
    route?:          string;
    contentTitle?:   string;
    createdAt?:      string;
    updatedAt?:      string;
}
export interface SubChapterForGetAll {
    id?:             string;
    pathName?:       string;
    fullpath?:       string;
    chapterId?:      string;
    icon?:           string;
    iconType?:       string;
    chapterType?:    string;
    label?:          string;
    route?:          string;
    contentTitle?:   string;
    createdAt?:      string;
    updatedAt?:      string;
}

export interface ChapterCreateDto {
    pathName:       string,
    icon:           string;
    iconType:       "pi"  | "mdi" | "img";
    chapterType:    "dir" | "file";
    label:          string;
    route:          string;
    createdAt:      string;
    updatedAt:      string;
}

export interface SubChapterCreateDto {
    pathName:       string,
    fullpath:       string;    
    chapterId:      number;
    icon:           string;
    iconType:       "pi"  | "mdi" | "img";
    chapterType:    "dir" | "file";
    label:          string;
    route:          string;
    createdAt:      string;
    updatedAt:      string;
}

export interface ChapterCreateResponse {
    id:             string;
    pathName:       string;
    icon:           string;
    iconType:       string;
    chapterType:    string;
    label:          string;
    route:          string;
    contentTitle:   string;
    createdAt:      string;
    updatedAt:      string;
}

export interface SubChapterCreateResponse {
    id:             string;
    pathName:       string;
    icon:           string;
    iconType:       string;
    chapterType:    string;
    label:          string;
    route:          string;
    contentTitle:   string;
    createdAt:      string;
    updatedAt:      string;
}