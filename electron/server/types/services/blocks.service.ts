
export interface BlockRaw {
    id:             string,
    chapterId:      string,
    subChapterId:   string,
    title:          string,
    content:        string,
    createdAt:      string,
    updatedAt:      string,
}

export interface BlockForGetAll {
    id:             number,
    chapterId:      number,
    subChapterId:   number,
    title:          string,
    content:        string,
    createdAt:      string,
    updatedAt:      string,
}