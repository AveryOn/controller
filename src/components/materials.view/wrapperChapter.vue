<template>
    <div class="wrapper-material-chapter">
        <!-- Диалоговое меню для создания нового подраздела -->
        <createSubChapterDialog 
        v-model="isShowCreateSubChapter" 
        @submit-form="requestForCreateSubChapter"
        />
        <!-- Диалоговое окно для удаление подраздела -->
        <deleteChapterDialog 
        v-model="isShowDeleteChapter" 
        @delete="requestDeleteChapter"
        />
        <!-- Диалоговое окно для удаление раздела/подраздела -->
        <editChapterDialog
        :init-form-data="initDataEditForm"
        :chapter-label="opennedChapter?.label!"
        v-model="isShowEditChapter"
        @submit-form="requestForEdit"
        />
        <!-- Menu -->
        <Menubar class="w-11" :model="itemsCorrect" >
            <template #item="{ item, props }">
                <a class="menu-bar-item" v-bind="props.action">
                    <svg-icon v-if="item.iconType === 'mdi'" :type="item.iconType" :path="item.icon" :size="20"></svg-icon>
                    <i v-else :class="item.icon"></i>
                    <span>{{ item.label }}</span>
                </a>
            </template>
        </Menubar>
        <h2 class="not-data-note" v-show="blocks.length === 0">
            Empty
        </h2>
        <div class="wrapper-blocks px-4 py-2" v-show="blocks.length > 0">
            <article
            class="data-block" 
            v-for="block in blocks" 
            :key="block.id"
            >
                article {{ block.id }}
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router';
import { createSubChapter, editChapterApi, getOneChapter, getOneSubChapter, syncMaterials } from '../../api/materials.api';
import { computed, type ComputedRef, ref, type Ref } from 'vue';
import { Chapter, ChapterCreate, ChapterEdit, ChapterEditRequest, CreateChapterForm, SubChapterCreate } from '../../@types/entities/materials.types';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTabPlus } from '@mdi/js';
import createSubChapterDialog from './dialogs/createSubChapterDialog.vue';
import deleteChapterDialog from './dialogs/deleteChapterDialog.vue';
import editChapterDialog from './dialogs/editChapterDialog.vue';
import { trimPath } from '../../utils/strings.utils';

const emit = defineEmits<{
    (e: 'openChapter', label: string): void;
    (e: 'quit'): void;
}>();

const isShowCreateSubChapter = ref(false);
const isShowDeleteChapter = ref(false);
const isShowEditChapter = ref(false);
const opennedChapter: Ref<Chapter | null> = ref(null);
const items = ref([
    {
        label: 'New Block',
        icon: 'pi pi-plus',
        iconType: 'pi'
    },
    {
        label: 'Add SubChapter',
        icon: mdiTabPlus,
        iconType: 'mdi',
        forType: 'dir',
        command: addNewSubChapter,
    },
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        iconType: 'pi',
        command: editChapter,
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        iconType: 'pi',
        command: deleteChapter,
    },
]);

const itemsCorrect = computed(() => {
    return items.value.filter((item) => {
        if(opennedChapter.value?.chapterType !== 'dir' && item.forType === 'dir') return false;
        return true;
    })
});
const blocks = computed(() => {
    if(opennedChapter.value) {
        return opennedChapter.value.content.blocks;
    }
    return [/* {id: 1}, {id: 2}, {id:3} */];
});
const initDataEditForm: ComputedRef<CreateChapterForm | null> = computed(() => {
    if(opennedChapter.value) {
        return {
            iconImg: opennedChapter.value.iconType === 'img'? opennedChapter.value.icon : null,
            iconType: opennedChapter.value.iconType,
            label: opennedChapter.value.label,
            pathName: computePathNameForEdit(),
            symbol: 
                (opennedChapter.value.iconType === 'mdi' || opennedChapter.value.iconType === 'pi') ? 
                opennedChapter.value.icon : '',
            type: opennedChapter.value.chapterType,
        } as CreateChapterForm
    }
    return null;
});
// Сформировать копию пришедших данных (для проверки на изменение полей)
const copyEditFormData = computed(() => {
    if(initDataEditForm.value) {
        return JSON.parse(JSON.stringify(initDataEditForm.value)) as CreateChapterForm;
    }
    else return void undefined;
});

// Вычисляет ключ pathName для computed initDataEditForm чтобы подразделы имели свой pathName
function computePathNameForEdit() {
    if(opennedChapter.value?.pathName) return opennedChapter.value.pathName;
    if(opennedChapter.value?.fullpath) {
        return trimPath(opennedChapter.value.fullpath, { split: true }).at(-1);
    }
}

// Вызов окна для создания нового подраздела 
function addNewSubChapter() {
    closeAllWins();
    isShowCreateSubChapter.value = true;
}
// Вызов окна для удаления текущего раздела 
function deleteChapter() {
    closeAllWins();
    isShowDeleteChapter.value = true;
}
// Вызов окна для редактировния текущего раздела 
function editChapter() {
    closeAllWins();
    isShowEditChapter.value = true;
}

// Запрос на создание нового подраздела
async function requestForCreateSubChapter(newSubChapter: ChapterCreate) {
    try {
        let pathName: string;
        if(opennedChapter.value?.fullpath) {
            pathName = trimPath(opennedChapter.value.fullpath, { split: true })[0];
        } 
        else pathName = opennedChapter.value?.pathName!;
        if(!pathName) throw '[requestForCreateSubChapter]>> pathName не сформирован';
        const currentPath = opennedChapter.value?.pathName? opennedChapter.value?.pathName : opennedChapter.value?.fullpath;
        const correctSubChapter: SubChapterCreate = {
            pathName: pathName,
            chapterType: newSubChapter.chapterType,
            fullpath: `${currentPath}/${newSubChapter.pathName}`,
            icon: newSubChapter.icon,
            iconType: newSubChapter.iconType,
            label: newSubChapter.label,
            route: newSubChapter.route,
        }
        const result = await createSubChapter(correctSubChapter);
        // Синхронизация подразделов с меню
        await syncMaterials();
    } catch (err) {
        console.error(err);
        throw err;
    }
}
// Закрыть все диалоговые окна
function closeAllWins () {
    isShowCreateSubChapter.value = false;
    isShowDeleteChapter.value = false;
    isShowEditChapter.value = false;
}

// Сброс локального состояния компонента (e.g для перехода на другой маршрут)
function resetState() {
    closeAllWins();
    opennedChapter.value = null;
}

// Запрос на удаление Раздела/Подраздела
async function requestDeleteChapter() {
    try {
        isShowDeleteChapter.value = false;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Поиск разницы в данных копии и новый данных при редактировании
function isDifferentDataEditForm(copy: CreateChapterForm, newData: ChapterCreate): { isDiff: boolean, keys: string[] } {
    try {
        let isDifferent = false;
        const setDiffTrue = (key: string) => {
            diffDataKeys.push(key);
            isDifferent = true;
        }
        const diffDataKeys: string[] = [];  // Массив ключей, данных которые были изменены
        if(copy.iconType !== newData.iconType) setDiffTrue('iconType');
        if(copy.iconType === 'img' && copy.iconImg !== newData.icon) setDiffTrue('icon');
        if(copy.iconImg !== 'img' && copy.symbol !== newData.icon) {
            setDiffTrue('icon');
        }
        if(copy.label !== newData.label) setDiffTrue('label');
        if(copy.pathName !== newData.pathName) setDiffTrue('pathName');
        if(copy.type !== newData.chapterType) setDiffTrue('chapterType');
        return { isDiff: isDifferent, keys: diffDataKeys };
    } catch (err) {
        console.error(err);
        throw err;
    }
}
// Подготовить данные для редактирования раздела/подраздела
function prepareDataForEdit(data: ChapterCreate, diffKeys: string[]): ChapterEdit {
    try {
        if (!diffKeys || !Array.isArray(diffKeys)) throw TypeError('prepareDataForEdit > аргумент diffKeys должен быть массивом');
        type KeyDiffs = keyof ChapterCreate;
        const finalObj: ChapterEdit = {};
        return diffKeys.reduce((acc: ChapterEdit, key: string) => {
            let keyDiff = key as KeyDiffs;
            acc[keyDiff] = data[keyDiff] as any;
            return acc;
        }, finalObj);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Запрос на редактирование общих данных подраздела (иконка, название, путь и пр.)
async function requestForEdit(data: ChapterCreate) {
    const computePathName = () => {
        if(opennedChapter.value?.pathName) return opennedChapter.value?.pathName;
        else if(opennedChapter.value?.fullpath) {
            return trimPath(opennedChapter.value?.fullpath, { split: true })[0];
        }
        else throw '[requestForEdit > computePathName]>> Ошибка при извлечении pathName';
    }
    try {
        if(copyEditFormData.value) {
            const { isDiff, keys } = isDifferentDataEditForm(copyEditFormData.value, data);
            // Если данные были изменены, то запрос проходит
            if(isDiff) {
                // Подготовливаем данные для отправки на сервер
                const editData: ChapterEdit = prepareDataForEdit(data, keys);
                const readyObject: ChapterEditRequest = { 
                    params: editData, 
                    fullpath: opennedChapter.value?.fullpath || undefined, 
                    pathName: computePathName(),
                }
                const result: Chapter = await editChapterApi(JSON.parse(JSON.stringify(readyObject)));
                // Синзронизация материалов в меню
                await syncMaterials();
                return result;
            }
        }
        else console.log('[requestForEdit] Копии формы для редактирования нет');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Добавить имя пути для подраздела (по умолчанию подразделы приходят с БД без ключа pathName)
function addPathNameInSubChapter(subChapter: Chapter) {
    try {
        if(!subChapter.pathName && subChapter.fullpath) {
            subChapter.pathName = trimPath(subChapter.fullpath, { split: true }).at(-1);
        }
        return subChapter;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

onBeforeRouteUpdate( async (to, from, next) => {
    resetState();
    // Запрос на получение данных раздела в случае его выбора
    const prevChapter = from.params['chapter'] as string;
    const nextChapter = to.params['chapter'] as string;
    const nextSubChapter = to.query['subChapter'] as string | undefined;
    const prevSubChapter = from.query['subChapter'] as string | undefined;
    if(nextChapter !== 'add-chapter') {
        if(nextChapter && nextChapter !== prevChapter) {
            opennedChapter.value = await getOneChapter({ pathName: nextChapter });
            emit('openChapter', opennedChapter.value.label);
        }
        // Если происходит выход из просмотра разделов и подразделов
        else if(!nextChapter) emit('quit');
        // В случае смены подраздела при активном разделе
        if(nextSubChapter && nextSubChapter !== prevSubChapter) {
            const correctFullpath = nextSubChapter.split('>').join('/');
            const { chapter, labels } = await getOneSubChapter({ pathName: nextChapter, fullpath: correctFullpath });
            // opennedChapter.value = addPathNameInSubChapter(chapter);
            opennedChapter.value = chapter;
            emit('openChapter', labels.join(' > '));
        } 
        else {
            // Если маршрут перешел с подраздела на раздел
            if(prevChapter === nextChapter && !nextSubChapter) {
                opennedChapter.value = await getOneChapter({ pathName: nextChapter });
                emit('openChapter', opennedChapter.value.label);
            }
        }
        return void next();
    } else {
        emit('openChapter', 'Add New Chapter');
    }
    next();
});


</script>
<style scoped>

.wrapper-material-chapter {
    width: 100%;
    height: 95vh !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    overflow: hidden !important;
}
.menu-bar-item {
    display: flex;
    align-items: center;
}
.not-data-note {
    font-family: var(--font);
    color: var(--light-text-3);
    margin: auto;
    user-select: none;
}
.wrapper-blocks {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.data-block {
    width: 100%;
    height: 600px;
    flex: 0 0 auto;
    border: 1px solid red; 
}
</style>