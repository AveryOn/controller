<template>
    <div class="materials-workspace gap-2">
        <!-- Форма создания нового блока -->
        <CreateBlockForm 
        :loading="isLoadingCreateBlock"
        v-model="isActiveCreateForm"
        @submit-form="reqCreateBlockMaterial"
        />
        <!-- Если блоков нет -->
        <div v-if="blocks.length <= 0" class="if-not-blocks gap-3">
            <h2 class="if-not-blocks__note">Empty</h2>
            <Button 
            label="Add Block"
            severity="help"
            outlined
            icon-pos="right"
            icon="pi pi-plus"
            @click="() => activeCreateForm()"
            />
        </div>
        <!-- <div class="editor-wrapper gap-2" v-if="isActiveTextEditor">
            <IftaLabel class="w-5 mt-2 mx-auto" >
                <InputText class="w-full" id="label" v-model="label" />
                <label for="label">Label</label>
            </IftaLabel>
            <textEditor
            :initial-value="initEditorContent"
            @update:content="(content: string) => editorContent = content"
            :editor-styles="{ height: '100%', width: '100%' }"
            show-save
            />
            <Button class="-mt-1 mb-1" label="Save" @click="saveContentBlock" :loading="isLoadingSaveContent"/>
        </div> -->
        <div class="wrapper-blocks px-4 py-2" v-show="blocks.length > 0 && !isActiveTextEditor">
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
import { computed, defineProps } from 'vue';
import { Chapter, CreateChapterBlock } from '../../../@types/entities/materials.types';
import textEditor from '../base/textEditor.vue';
import { ref, type Ref } from 'vue';
import useNotices from '../../../composables/notices';
import CreateBlockForm from './createBlockForm.vue';
import { createChapterBlockApi } from '../../../api/materials.api';
import { trimPath } from '../../../utils/strings.utils';
type ModeEditor = 'new-block' | 'edit-block';
interface Props {
    chapter: Chapter | null;
}
const props = withDefaults(defineProps<Props>(), {

});

const notice = useNotices();

const isLoadingSaveContent = ref(false);
const isLoadingCreateBlock = ref(false);
const modeEditor: Ref<ModeEditor> = ref('new-block');
const isActiveTextEditor = ref(false);
const isActiveCreateForm = ref(false);
const label = ref('');
const editorContent = ref('');
const initEditorContent = ref(null);

const blocks = computed(() => {
    // if(props.chapter) {
    //     return props.chapter.content.blocks;
    // }
    return [/* {id: 1}, {id: 2}, {id:3} */];
});

const pathName = computed(() => {
    if(props.chapter && props.chapter.fullpath) {
        return (trimPath(props.chapter.fullpath, { split: true }) as string[])[0];
    }
    else return null;
})

// Включить форму создания нового блока
function activeCreateForm() {
    isActiveCreateForm.value = true;
}

// Включить текстовый редактор
function activeTextEditor(mode: 'new-block' | 'edit-block') {
    modeEditor.value = mode;
    isActiveTextEditor.value = true;
}

// Сохранить контент для текущего блока
function saveContentBlock() {
    try {
        isLoadingSaveContent.value = true;
        if (!label.value || !editorContent.value) {
            return void notice.show({ detail: 'Filled All Data!', severity: 'error' });
        }
        console.log(label.value, label.value.length);
    } catch (err) {
        throw err
    } finally {
        isLoadingSaveContent.value = false;
    }
}

async function reqCreateBlockMaterial(data: CreateChapterBlock) {
    try {
        console.log(props.chapter);
        
        if(!props.chapter?.id) throw new Error('[reqCreateBlockMaterial]>> Chapter ID не существует');
        if(!pathName.value) throw new Error('[reqCreateBlockMaterial]>> Chapter pathName не существует');
        isLoadingCreateBlock.value = true;
        if(!data.title || data.title.length < 3) {
            return void notice.show({ detail: 'Title length must be either greater or equal 3', severity: 'error' });
        }
        data.chapterId = props.chapter.id;
        data.pathName = pathName.value;
        const result = await createChapterBlockApi(data);
        console.log(result);
    } catch (err) {
        console.error(err);
        throw err
    } finally {
        isLoadingCreateBlock.value = false;
    }

}

</script>

<style scoped>
.materials-workspace {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-bottom: 1px solid var(--light-text-1);
}
.if-not-blocks {
    width: 200px;
    margin: auto;
    display: flex;
    flex-direction: column;
}
.if-not-blocks__note {
    font-family: var(--font);
    color: var(--light-text-3);
    margin: auto;
    user-select: none;
}
.editor-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
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