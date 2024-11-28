<template>
    <div class="wrapper-material-chapter">
        <!-- Диалоговое меню -->
        <dialogComp v-model="isShowCreateSubChapter" :is-modal="false">
            <template #header>
                <div class="subchapter-form-header w-full flex justify-content-center">
                    <span class="font-bold">Add New Subchapter</span> 
                </div>
            </template>
            <template #default>
                <addChapter @submit-form="requestForCreateSubChapter" form-type="return"/>
            </template>
        </dialogComp>

        <!-- Menu -->
        <Menubar class="w-11" :model="items" >
            <template #item="{ item, props }">
                <a class="flex items-center" v-bind="props.action">
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
import { createSubChapter, getOneChapter } from '../../api/materials.api';
import { computed, ref, type Ref } from 'vue';
import { Chapter, ChapterCreate, SubChapter, SubChapterCreate } from '../../@types/entities/materials.types';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTabPlus } from '@mdi/js';
import dialogComp from '../base/dialogComp.vue';
import addChapter from './addChapter.vue';

interface Example1 {
    name: string,
    age: string,
}
interface Example2 {
    name: string,
    age: string,
    email: string;
}

const isShowCreateSubChapter = ref(false);
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
        command: addNewSubChapter,
    },
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        iconType: 'pi'
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        iconType: 'pi'
    },
]);
const emit = defineEmits<{
    (e: 'openChapter', label: string): void;
}>();

const blocks = computed(() => {
    if(opennedChapter.value) {
        return opennedChapter.value.content.blocks;
    }
    return [/* {id: 1}, {id: 2}, {id:3} */];
});

function addNewSubChapter() {
    isShowCreateSubChapter.value = true;
}

// Запрос на создание нового подраздела
async function requestForCreateSubChapter(newSubChapter: ChapterCreate) {
    try {
        const currentPath = opennedChapter.value?.pathName? opennedChapter.value?.pathName : opennedChapter.value?.fullpath;
        const correctSubChapter: SubChapterCreate = {
            chapterId: opennedChapter.value!.id,
            chapterType: newSubChapter.chapterType,
            fullpath: `${currentPath}/${newSubChapter.pathName}`,
            icon: newSubChapter.icon,
            iconType: newSubChapter.iconType,
            label: newSubChapter.label,
            route: newSubChapter.route,
        }
        const result = await createSubChapter(correctSubChapter);
        console.log(result);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

onBeforeRouteUpdate( async (to, from, next) => {
    // Запрос на получение данных раздела в случае его выбора
    const prevChapter = from.params['chapter'] as string;
    const nextChapter = to.params['chapter'] as string;
    console.log(prevChapter, nextChapter);
    if(nextChapter !== 'add-chapter') {
        if( nextChapter && nextChapter !== prevChapter) {
            opennedChapter.value = await getOneChapter({ pathName: nextChapter });
            console.log(opennedChapter.value);
            emit('openChapter', opennedChapter.value.label);
        }
        return void next();
    } else {
        emit('openChapter', 'Add New Chapter');
    }
    next();
});


</script>
<style scoped>
.subchapter-form-header {
    cursor: move;
}
.wrapper-material-chapter {
    width: 100%;
    height: 95vh !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    overflow: hidden !important;
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