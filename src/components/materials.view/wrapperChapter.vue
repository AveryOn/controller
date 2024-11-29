<template>
    <div class="wrapper-material-chapter">
        <!-- Диалоговое меню для создания нового подраздела -->
        <createSubChapterDialog 
        v-model="isShowCreateSubChapter" 
        @submit-form="requestForCreateSubChapter"
        />
        <!-- Диалоговое окно для удаление подраздела -->
        <deleteChapterDialog v-model="isShowDeleteChapter" @delete="requestDeleteChapter"/>
        <!-- Диалоговое окно для удаление раздела/подраздела -->
        <editChapterDialog 
        :chapter-label="opennedChapter?.label!"
        v-model="isShowEditChapter"
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
import { createSubChapter, getOneChapter, getOneSubChapter, syncMaterials } from '../../api/materials.api';
import { computed, ref, type Ref } from 'vue';
import { Chapter, ChapterCreate, SubChapterCreate } from '../../@types/entities/materials.types';
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
        if(opennedChapter.value?.chapterType !== 'dir') {
            if(item.forType === 'dir') {
                return false;
            }
        }
        return true;
    })
})
const blocks = computed(() => {
    if(opennedChapter.value) {
        return opennedChapter.value.content.blocks;
    }
    return [/* {id: 1}, {id: 2}, {id:3} */];
});

function addNewSubChapter() {
    isShowCreateSubChapter.value = true;
}
function deleteChapter() {
    isShowDeleteChapter.value = true;
}
function editChapter() {
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

// Запрос на удаление Раздела/Подраздела
async function requestDeleteChapter() {
    try {
        console.log('request delete');
        isShowDeleteChapter.value = false;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
onBeforeRouteUpdate( async (to, from, next) => {
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