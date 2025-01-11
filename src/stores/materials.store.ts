import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";
import { Chapter, ChapterForMenu } from "../@types/entities/materials.types";
import { getChapters } from "../api/materials.api";

export const useMaterialsStore = defineStore('materialsStored', () => {
    const addChapterItem = {
        label: 'Add Chapter',
        icon: 'pi pi-plus',
        route: 'materials',
        pathName: 'add-chapter',
        meta: true,
    }
    const loadingChapterItem = { type: 'loading', meta: true }
    const materialChaptersMenu: Ref<ChapterForMenu[]> = ref([loadingChapterItem, addChapterItem]);
    const materialChapters: Ref<Chapter[]> = ref([]);
    const loadingGetMenuChapters = ref(true);
    const loadingGetChapter = ref(false);
    const loadingCreateChapter = ref(false);
    const loadingEditChapter = ref(false);
    const loadingDeleteChapter = ref(false);

    // Состояние определяет какую либо асинхронную операцию для отображение прогресс бара в заголовке стр materials
    const globalLoadingMaterials = computed(() => {
        const deps = [
            loadingGetChapter.value,
            loadingCreateChapter.value,
        ]
        return deps.some((state) => state === true);
    });

    // Функция нужна, для перерисовки текущего состояния меню панели, при получении её обновленных данных
    function updateMenuItems(items: ChapterForMenu[]) {
        materialChaptersMenu.value.length = 0;
        materialChaptersMenu.value.push(...items, addChapterItem);
    }

    // Запросить элементы меню панели материалов
    async function getMaterialsMenu() {
        try {
            loadingGetMenuChapters.value = true;
            if(materialChaptersMenu.value[0].type === 'loading') {
                const token = localStorage.getItem('token') ?? '';
                const items = await getChapters({ forMenu: true, token: token });
                updateMenuItems(items);
            } 
        } catch (err) {
            throw err;
        }
        finally {
            loadingGetMenuChapters.value = false;
        }
    }

    return {
        materialChaptersMenu,
        materialChapters,
        loadingGetChapter,
        globalLoadingMaterials,
        loadingCreateChapter,
        loadingEditChapter,
        loadingDeleteChapter,
        getMaterialsMenu,
        updateMenuItems,
    }
});