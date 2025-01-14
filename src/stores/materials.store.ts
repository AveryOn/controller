import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";
import { Chapter, ChapterForMenu, LabelsInfoStorage } from "../@types/entities/materials.types";
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
                console.log(items);
                updateMenuItems(items);
            } 
        } catch (err) {
            throw err;
        }
        finally {
            loadingGetMenuChapters.value = false;
        }
    }

    // Получение информации о метках разделов
    function getLabelsInfoFromLocalStorage(): LabelsInfoStorage {
        try {
            let labelsInfo: LabelsInfoStorage | null = JSON.parse(localStorage.getItem('materials-info-labels')!);
            if(!labelsInfo) {
                localStorage.setItem("materials-info-labels", JSON.stringify({}));
            }
            return labelsInfo || {};
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    // Сохранение меток разделов/подразделов в LS 
    function setLabelsInfoInLocalStorage(pathName: string, fullpath: string, label: string): boolean {
        if(!pathName || typeof pathName !== 'string') throw new TypeError('[storeLabelsInLocalStorage]> pathName must be a string');
        if(!fullpath || typeof fullpath !== 'string') throw new TypeError('[storeLabelsInLocalStorage]> fullpath must be a string');
        if(!label || typeof label !== 'string')       throw new TypeError('[storeLabelsInLocalStorage]> label must be a string');
        try {
            let labelsInfo = getLabelsInfoFromLocalStorage();
            // Если такой ключ (запись о разделе) уже есть, то label добавляется.
            if(labelsInfo && Object.prototype.hasOwnProperty.call(labelsInfo, pathName)) {
                const fullLabels = labelsInfo[pathName].fullLabel;

                if(!fullLabels.includes(label)) {
                    // если текущее фактическое количество открытых подразделов меньше чем количество меток label
                    // то значит, что следующий подраздел на одном уровне с предыдущим
                    if((fullLabels.length + 1) > fullpath.split('/').length) {
                        fullLabels[fullLabels.length - 1] = label;  // т.к переход на одном уровне то заменяем пред. label на след. 
                    }
                    else {
                        fullLabels.push(label);
                    }
                }
                else {
                    const levelIdx = fullLabels.findIndex((value) => label === value);
                    labelsInfo[pathName].fullLabel = fullLabels.slice(0, (levelIdx + 1));
                }
                labelsInfo[pathName].fullpath = fullpath;
                localStorage.setItem('materials-info-labels', JSON.stringify(labelsInfo))
            }
            else {
                labelsInfo = {};
                labelsInfo[pathName] = { fullLabel: [label], fullpath };
                localStorage.setItem('materials-info-labels', JSON.stringify(labelsInfo))
            }
            return true;
        } catch (err) {
            console.error(err);
            throw err;
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
        setLabelsInfoInLocalStorage,
        getLabelsInfoFromLocalStorage
    }
});