
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