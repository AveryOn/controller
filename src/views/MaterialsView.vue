<template>
    <div class="materials-view">
        <header class="materials-header">
            <span class="refresh-sync-btn" @click="calledSyncMaterialsMenu" title="sync menu">
                <svg-icon class="refresh-sync-icon" type="mdi" :path="mdiRefresh" :size="18"></svg-icon>
            </span>
            <span class="flex head-label">Materials {{ correctLabelChapter }}</span> 
            <ProgressBar class="progress-bar" v-if="materialStore.globalLoadingMaterials" mode="indeterminate" style="height: 2px"></ProgressBar>
            <svg-icon class="close-btn" type="mdi" :path="mdiCloseBoxOutline" :size="18" @click="toDefaultPage"></svg-icon>
        </header>
        <div class="materials-main">
            <addChapter 
            class="m-auto"
            v-show="$route.params['chapter'] === 'add-chapter'"
            :loading="materialStore.loadingCreateChapter"
            @submit-form="requestForChapterCreate"
            />
            <wrapperChapter 
            :full-label="labelChapter"
            :root-chapter-id="rootChapterId"
            v-show="$route.params['chapter'] !== 'add-chapter' && $route.params['chapter']" 
            @open-chapter="(label) => console.log(label)"
            @update-root-chapter-id="(id: number) => rootChapterId = id"
            @quit="handlerQuitChapter"
            />
        </div>
    </div>
</template>

<script setup lang=ts>
import { computed, onMounted, ref, type Ref } from 'vue';
import addChapter from '../components/materials.view/addChapter.vue';
import wrapperChapter from '../components/materials.view/wrapperChapter.vue';
//@ts-expect-error
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiRefresh, mdiCloseBoxOutline } from '@mdi/js';
import { ChapterCreate } from '../@types/entities/materials.types';
import { createChapter, syncMaterials } from '../api/materials.api';
import { useMaterialsStore } from '../stores/materials.store';
import { useRouter } from 'vue-router';

const router = useRouter();
const labelChapter: Ref<string> = ref('');
const materialStore = useMaterialsStore();
const rootChapterId: Ref<number | null> = ref(null);

const correctLabelChapter = computed(() => {
    if(materialStore.materialsLabel.length > 0) {
        return ' > '+ materialStore.materialsLabel.join(' > ');
    }
    return labelChapter.value;
})

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

// Переход на default 
function toDefaultPage() {
    localStorage.removeItem('current_route');
    router.push({ name: 'default' });
    labelChapter.value = '';
    materialStore.removeMaterialsFullLabels();
}

// Обработка закрытия раздела/подраздела
function handlerQuitChapter() {
    labelChapter.value = '';
    materialStore.removeMaterialsFullLabels();
}

// Запустить синхронизацию меню материалов вручную
async function calledSyncMaterialsMenu() {
    try {
        materialStore.loadingGetMenuChapters = true;
        await syncMaterials();
    } catch (err) {
        console.error('[calledSyncMaterialsMenu]>> не удалось выполнить синхронизацию меню материалов');
    }
    finally {
        materialStore.loadingGetMenuChapters = false;
    }

}

onMounted(() => {
    labelChapter.value = ' > ' + materialStore.getMaterialsFullLabels().join(' > ');
})

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
    overflow: hidden;
    display: flex;
    justify-content: center;
    font-family: var(--font);
    background-color: var(--materials-header-bg);
    color: var(--materials-header-fg);
    font-weight: bolder;
}
.close-btn {
    position: absolute;
    right: 1rem;
    top: 0;
    background-color: rgba(0,0,0,0);
    outline: rgba(0,0,0,0);
    color: var(--materials-header-fg);
    font-weight: 600;
    padding: 0;
    height: max-content;
    width: max-content;
    cursor: pointer;
    transition: color 0.3s ease;
}
.close-btn:hover {
    transition: color 0.3s ease;
    color: var(--materials-header-fg);
}
.progress-bar {
    width: 100%;
    position: absolute;
}
.refresh-sync-btn {
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    position: absolute;
    left: 1rem;
    cursor: pointer;
}
.refresh-sync-btn:hover {
    background-color: rgba(0, 0, 0, 0.17);
    transition: all 0.3s ease;
}
.refresh-sync-btn:hover .refresh-sync-icon {
    color: rgb(0, 157, 255);
    transform: rotate(360deg);
    transition: all 0.3s ease;
}
.refresh-sync-icon {
    color: rgb(131, 195, 235);
    transition: all 0.3s ease-in; 
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