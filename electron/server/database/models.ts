import { ChapterCreate } from "../types/controllers/materials.types";

export class Chapter {
    chapter: ChapterCreate | null = null 
    constructor(chapter: ChapterCreate) {
        this.chapter = chapter;
    }

    check() {
        return true;
    }
    
}