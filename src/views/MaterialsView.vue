<template>
    <div class="materials-view">
        <header class="materials-header">
            <span class="refresh-sync-btn" @click="calledSyncMaterialsMenu" title="sync menu">
                <svg-icon class="refresh-sync-icon" type="mdi" :path="mdiRefresh" :size="18"></svg-icon>
            </span>
            <span class="flex head-label">Materials {{ correctLabelChapter }}</span>
            <ProgressBar class="progress-bar" v-if="materialStore.globalLoadingMaterials" mode="indeterminate"
                style="height: 2px"></ProgressBar>
            <svg-icon class="close-btn" type="mdi" :path="mdiCloseBoxOutline" :size="18"
                @click="toDefaultPage"></svg-icon>
        </header>
        <div class="materials-main">
            <addChapter class="m-auto" v-show="$route.params['chapter'] === 'add-chapter'"
                :loading="materialStore.loadingCreateChapter" @submit-form="requestForChapterCreate" />
            <wrapperChapter :blocks="blocks" :full-label="labelChapter" :root-chapter-id="rootChapterId"
                :fullpath="fullpath"
                :path-name="pathName"
                v-show="$route.params['chapter'] !== 'add-chapter' && $route.params['chapter']"
                @open-chapter="(label: any) => { label }" @update-root-chapter-id="(id: number) => rootChapterId = id"
                @update-full-label="(label: string) => updateFullLabel(label)"
                @delete-current-label="() => excludeLabelOfDeletedChapter()" @quit="handlerQuitChapter" 
                @add-new-block="(block) => blocks.push(block)"
                @delete-block="(blockId) => deleteBlock(blockId)"
                />
        </div>
    </div>
</template>

<script setup lang=ts>
import { computed, onBeforeMount, ref, type Ref } from 'vue';
import addChapter from '../components/materials.view/addChapter.vue';
import wrapperChapter from '../components/materials.view/wrapperChapter.vue';
//@ts-expect-error
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiRefresh, mdiCloseBoxOutline } from '@mdi/js';
import { Block, ChapterCreate, GetChapterBlocks } from '../@types/entities/materials.types';
import { createChapter, getChapterBlocksApi, getSubChapterBlocksApi, syncMaterials } from '../api/materials.api';
import { materialsRouter, useMaterialsStore } from '../stores/materials.store';
import { useRouter } from 'vue-router';
import { LocalVars } from '../@types/main.types';

const router = useRouter();
const materialStore = useMaterialsStore();

const labelChapter: Ref<string> = ref('');
const rootChapterId: Ref<number | null> = ref(null);

const pathName: Ref<string | null> = ref(null)
const fullpath: Ref<string | null> = ref(null)
const blocks: Ref<Array<Block>> = ref([]);

const correctLabelChapter = computed(() => {
    if (materialStore.materialsLabel.length > 0) {
        return ' > ' + materialStore.materialsLabel.join(' > ');
    }
    return labelChapter.value;
})

// запрос на создание раздела
async function requestForChapterCreate(newChapter: ChapterCreate) {
    try {
        materialStore.loadingCreateChapter = true;
        await createChapter(newChapter);
        await syncMaterials();
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        materialStore.loadingCreateChapter = false;
        router.push({ name: 'materials' });
    }
}

/**
 * При обновлении раздела/подраздела в случае если был изменен label необходимо обновить и fullLabel
 * @param label название раздела которое было обновлено
 */
function updateFullLabel(label: string) {
    materialStore.materialsLabel.pop()
    materialStore.materialsLabel.push(label);
}

/**
 * При удалении раздела/подраздела необходимо вырезать его label из общего fullLabel
 * @param label название раздела который был удален
 */
function excludeLabelOfDeletedChapter() {
    materialStore.materialsLabel.pop(); // удаляется label текущего открытого раздела
    // Также записать в localStorage
    materialStore.updateMaterialsFullLabels(materialStore.materialsLabel);
    window.location.reload();
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

let timerId: NodeJS.Timeout | undefined = undefined
/**
 * Выполнить запрос на получение блоков в зависимости от типа материала: `chapter` | `subChapter`
 * @param type `'chapter'` | `'subChapter'`
 */

async function getBlocks(type: 'chapter' | 'sub-chapter', params: GetChapterBlocks) {
    materialStore.loadingGetChapter = true

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
                console.log('ОТРАБОТАЛ GET CHAPTER');

                blocks.value = await getChapterBlocksApi({
                    chapterId: params.chapterId,
                }) as Block[];
            }
            // Получить блоки ПОДраздела
            else if (type === 'sub-chapter') {
                console.log('ОТРАБОТАЛ GET SUB CHAPTER');
                blocks.value = await getSubChapterBlocksApi({
                    chapterId: params.chapterId,
                }) as Block[];
            }
        }
        finally {
            materialStore.loadingGetChapter = false
        }

    }, duration)
}

async function deleteBlock(blockId: number) {
    blocks.value = blocks.value.filter((block) => block.id !== blockId)
}


onBeforeMount(() => {
    materialsRouter.subscribe(['materialUid'], async (state) => {
        console.log('WORK SPACE >>>> SUBSCRIBE', state.chapterId.value);

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


    const currentRoute: any = JSON.parse(localStorage.getItem(LocalVars.currentRoute)!);
    const chapter = currentRoute.params['chapter'] ?? null
    const subChapter = currentRoute.query['subChapter'] ?? null
    const chapterId = currentRoute.query['chapterId'] ?? null

    materialsRouter.setState({
        chapter: chapter,
        subChapter: subChapter,
        materialType: !!subChapter ? 'sub-chapter' : 'chapter',
        materialUid: `${chapter ?? 'void'}---${subChapter ?? 'void'}`,
        chapterId: +chapterId ? +chapterId : null,
    })

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
    background-color: rgba(0, 0, 0, 0);
    outline: rgba(0, 0, 0, 0);
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