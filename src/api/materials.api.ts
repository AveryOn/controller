import type { Chapter, ChapterForMenu, GetChaptersParams } from "../@types/entities/materials.types";

// Получить материлы с БД
export async function getChapters(params?: GetChaptersParams): Promise<ChapterForMenu[]> {
    try {
        return await window.electron.getChapters(params);
    } catch (err) {
        throw err;
    }
}