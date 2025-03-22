import type { Block, Chapter, ChapterForMenu, GetChapterBlocks, MaterialsRouterState, MaterialType } from "../@types/entities/materials.types";
import type { Ref } from "vue";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getChapterBlocksApi, getChapters, getSubChapterBlocksApi } from "../api/materials.api";
import { LocalVars } from "../@types/main.types";
import { StateManager } from "node-state-manager";

/**
 * Объект состояния для маршрутизации по странице материалов.
 * Нужен для хранения реактивных значений, которые определяют какие данные и UI необходимо отображать
*/
export const materialsRouter = new StateManager<MaterialsRouterState>('m-r-1', {
    chapter: null,
    subChapter: null,
    materialUid: null,
    materialType: null,
    chapterId: null,
})

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
    const pathName: Ref<string | null> = ref(null)
    const fullpath: Ref<string | null> = ref(null)
    const blocks: Ref<Array<Block>> = ref([]);

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

    /**
     * Обновить полный лэйбл для материалов
     * @param labels массив лэйблов для текущего раздела/подраздела
     * @param config ключи, необходимые для того чтобы определять на их основе, какой тип материала был открыт: `chapter` || `subChapter`
     */
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
     * Определить тип материала
     * @param {ChapterForMenu} item элемент меню материалов 
     * @returns {MaterialType} тип материала. Если не удалось определить, вернет `null` 
     */
    function determineMaterialType(item: ChapterForMenu): MaterialType {
        if(!item) {
            return null
        }
        if(item.pathName && !item.fullpath) {
            return 'chapter'
        }
        else if(item.pathName && item.fullpath) {
            return 'sub-chapter'
        }
        return null
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

    let timerId: NodeJS.Timeout | undefined = undefined
    /**
     * Выполнить запрос на получение блоков в зависимости от типа материала: `chapter` | `subChapter`
     * @param type `'chapter'` | `'subChapter'`
     */

    async function getBlocks(type: 'chapter' | 'sub-chapter', params: GetChapterBlocks) {
        loadingGetChapter.value = true

        let duration: number = 0

        if (timerId) {
            clearTimeout(timerId)
            timerId = undefined
        }
        else duration = 0

        timerId = setTimeout(async () => {
            try {
                // Получить блоки раздела
                if (type === 'chapter') {
                    blocks.value = await getChapterBlocksApi({
                        chapterId: params.chapterId,
                    }) as Block[];
                }
                // Получить блоки ПОДраздела
                else if (type === 'sub-chapter') {
                    blocks.value = await getSubChapterBlocksApi({
                        chapterId: params.chapterId,
                    }) as Block[];
                }
            }
            finally {
                loadingGetChapter.value = false
            }

        }, duration)
    }

    materialsRouter.subscribe(['chapterId', 'materialUid'], async (state) => {
    
        pathName.value = state.chapter.value
        fullpath.value = state.subChapter.value
        
        blocks.value.length = 0
        if (state.materialType.value) {
            await getBlocks(state.materialType.value!, {
                chapterId: state.chapterId.value!,
            })
        } else {
            throw new Error('WorkSpace >>> !materialType is not defined')
        }
    }, { fetch: '*' })

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
        pathName,
        fullpath,
        blocks,
        getMaterialsMenu,
        updateMenuItems,
        updateMaterialsFullLabels,
        getMaterialsFullLabels,
        removeMaterialsFullLabels,
        createMaterialElementId,
        determineMaterialType,
    }
});