import { defineStore } from "pinia";
import { type Ref, ref } from "vue";
import { Chapter, ChapterForMenu } from "../@types/entities/materials.types";

export const useMainStore = defineStore('mainStore', () => {
    const appTitle: Ref<string> = ref('controller'); 
    const materialChaptersMenu: Ref<ChapterForMenu[]> = ref([]);
    const materialChapters: Ref<Chapter[]> = ref([]);

    return {
        appTitle,
        materialChaptersMenu,
        materialChapters,
    }
});