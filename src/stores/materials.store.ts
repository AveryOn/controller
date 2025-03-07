import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";
import { Chapter, ChapterForMenu } from "../@types/entities/materials.types";
import { getChapters } from "../api/materials.api";
import { LocalVars } from "../@types/main.types";

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
    const loadingGetMenuChapters = ref(false);
    const loadingGetChapter = ref(false);
    const loadingCreateChapter = ref(false);
    const loadingEditChapter = ref(false);
    const loadingDeleteChapter = ref(false);
    const materialsLabel: Ref<Array<string>> = ref([]);

    // Состояние определяет какую либо асинхронную операцию для отображение прогресс бара в заголовке стр materials
    const globalLoadingMaterials = computed(() => {
        const deps = [
            loadingGetMenuChapters.value,
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
            if (materialChaptersMenu.value[0].type === 'loading') {
                const token = localStorage.getItem(LocalVars.token) ?? '';
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

    // Обновить полный лэйбл для материалов
    function updateMaterialsFullLabels(labels: string[]): void {
        materialsLabel.value = labels;
        localStorage.setItem(LocalVars.materialsFullLabel, JSON.stringify(labels))
    }

    // Получить полный лэйбл материалов
    function getMaterialsFullLabels(): string[] {
        if (materialsLabel.value.length > 0) {
            return materialsLabel.value;
        }
        return JSON.parse(localStorage.getItem(LocalVars.materialsFullLabel)!) ?? [];
    }
    function removeMaterialsFullLabels() {
        materialsLabel.value.length = 0;
        localStorage.removeItem(LocalVars.materialsFullLabel);
    }

    /**
     * Сформировать HTML id для элемента панели меню 
     * @param item элемент панели меню (раздел или подраздел), который имеет `id`, `pathName` и `pathname`?
     * @returns 
     */
    function createMaterialElementId(item: any): string {
        if (!item.id) return `item-${Date.now()}`;
        if (item?.fullpath) {
            return `${item.id}-${item.fullpath}`;
        }
        else if (item?.pathName) {
            return `${item.id}-${item.pathName}`;
        }
        else {
            return `item-${Date.now()}`;
        }
    }

    return {
        materialsLabel,
        materialChaptersMenu,
        materialChapters,
        loadingGetChapter,
        globalLoadingMaterials,
        loadingGetMenuChapters,
        loadingCreateChapter,
        loadingEditChapter,
        loadingDeleteChapter,
        getMaterialsMenu,
        updateMenuItems,
        updateMaterialsFullLabels,
        getMaterialsFullLabels,
        removeMaterialsFullLabels,
        createMaterialElementId,
    }
});