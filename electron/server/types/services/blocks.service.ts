
export interface BlockRaw {
    id:             string,
    chapterId:      string,
    subChapterId:   string,
    title:          string,
    content:        string,
    createdAt:      string,
    updatedAt:      string,
}

export interface BlockForGet {
    id:             number,
    chapterId:      number,
    subChapterId:   number,
    title:          string,
    content:        string,
    createdAt:      string,
    updatedAt:      string,
}

export interface CreateBlockDto {
    chapterId:      number | null,
    subChapterId:   number | null,
    title:          string,
}

export interface GetBlockByTitle {
    chapterId?:      number | null,
    subChapterId?:   number | null,
    title:          string,
}

export interface UpdateBlockByTitle {
    chapterId?:      number,
    subChapterId?:   number,
    title?:          string,
    content?:        string,
    updatedAt?:      string,
}