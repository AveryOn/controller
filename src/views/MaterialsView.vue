<template>
    <div class="materials-view">
        <header class="materials-header">
            <svg-icon class="head-icon" type="mdi" :path="mdiSpaceInvaders" :size="18"></svg-icon>
            <span class="flex head-label">Materials {{ openChapterName }}</span> 
            <ProgressBar class="progress-bar" v-if="materialStore.globalLoadingMaterials" mode="indeterminate" style="height: 2px"></ProgressBar>
        </header>
        <div class="materials-main">
            <addChapter 
            class="m-auto"
            v-show="$route.params['chapter'] === 'add-chapter'"
            :loading="materialStore.loadingCreateChapter"
            @submit-form="requestForChapterCreate"
            />
            <wrapperChapter 
            v-show="$route.params['chapter'] !== 'add-chapter' && $route.params['chapter']" 
            @open-chapter="(label) => labelChapter = label"
            @quit="labelChapter = null"
            />
        </div>
    </div>
</template>

<script setup lang=ts>
import { computed, ref, type Ref } from 'vue';
import addChapter from '../components/materials.view/addChapter.vue';
import wrapperChapter from '../components/materials.view/wrapperChapter.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiSpaceInvaders } from '@mdi/js';
import { ChapterCreate } from '../@types/entities/materials.types';
import { createChapter } from '../api/materials.api';
import { useMaterialsStore } from '../stores/materials.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const labelChapter: Ref<string | null> = ref(null);
const materialStore = useMaterialsStore();

const openChapterName = computed(() => {
    if(labelChapter.value !== 'add-chapter') {
        if(labelChapter.value) return `> ${labelChapter.value}`;
        else return '';
    }
    else return '> New Chapter';
});

// запрос на создание раздела
async function requestForChapterCreate(newChapter: ChapterCreate) {
    try {
        materialStore.loadingCreateChapter = true;
        await createChapter(newChapter);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        materialStore.loadingCreateChapter = false;
        router.push({ name: 'materials' });
    }
}
</script>

<style scoped>
.materials-view {
    width: 100%;
    height: 100%;
    height: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--bg-color);
    color: var(--fg-color);
}
.materials-header {
    position: relative;
    width: 100%;
    height: max-content;
    display: flex;
    justify-content: center;
    font-family: var(--font);
    background-color: var(--materials-header-bg);
    color: var(--materials-header-fg);
    font-weight: bolder;
}
.progress-bar {
    width: 100%;
    position: absolute;
}
.head-icon {
    position: absolute;
    left: 1rem;
}
.head-label {
    user-select: none;
}
.materials-main {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
}

</style>