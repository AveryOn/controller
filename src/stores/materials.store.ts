import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";
import { Chapter, ChapterForMenu } from "../@types/entities/materials.types";

export const useMaterialsStore = defineStore('materialsStored', () => {
    const materialChaptersMenu: Ref<ChapterForMenu[]> = ref([]);
    const materialChapters: Ref<Chapter[]> = ref([]);
    const loadingGetChapter = ref(false);
    const loadingCreateChapter = ref(false);

    // Состояние определяет какую либо асинхронную операцию для отображение прогресс бара в заголовке стр materials
    const globalLoadingMaterials = computed(() => {
        const deps = [
            loadingGetChapter.value,
            loadingCreateChapter.value,
        ]
        return deps.some((state) => state === true);
    });

    return {
        materialChaptersMenu,
        materialChapters,
        loadingGetChapter,
        globalLoadingMaterials,
        loadingCreateChapter,
    }
});