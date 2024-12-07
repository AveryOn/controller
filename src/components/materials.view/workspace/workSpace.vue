<template>
    <div ref="workspaceDiv" class="materials-workspace gap-2">
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
 
        <div class="wrapper-blocks px-4 py-2" v-show="blocks.length > 0">
            <div class="wrapper-block__header w-6 mx-auto flex align-items-center justify-content-center">
                <h2 v-if="props.chapter?.content?.title">{{ props.chapter?.content?.title }}</h2>
                <span v-else class="flex gap-2">
                    <InputText 
                    class="" 
                    id="label" 
                    v-model="contentTitle" 
                    size="small" 
                    placeholder="Label"
                    />
                    <Button 
                    class="px-2"
                    icon="pi pi-check" 
                    size="small" 
                    severity="secondary"
                    :loading="isLoadingEditContentTitle"
                    @click="editContentTitle"
                    />
                </span>
            </div>
            <Accordion :value="currentBlockId"  @tab-open="({ index }) => currentBlockId = index">
                <AccordionPanel v-for="block in blocks" :key="block.id" :value="block.id">
                    <AccordionHeader>
                        <div class="block-header__title flex align-items-center gap-3">
                            <h3 v-if="opennedEditTitleBlock !== block.id">{{ block.title }}</h3>
                            <InputText 
                            v-else 
                            @click.stop 
                            type="text" 
                            v-model="titleBlock" 
                            placeholder="Title"  
                            size="small"
                            />
                            <Button 
                            :id="`btn-edit-title-${block.id}`"
                            @click.stop="() => openEditTileBlock(block.id, block.title)" 
                            class="py-1"
                            :icon="opennedEditTitleBlock === block.id? 'pi pi-check' : 'pi pi-pencil'" 
                            size="small" 
                            :loading="opennedEditTitleBlock === block.id && isLoadingEditTitleBlock"
                            severity="secondary"
                            />
                        </div>
                    </AccordionHeader>
                    <AccordionContent>
                        <div class="block-content-wrapper">
             
                            <!-- Menu -->
                            <Menubar class="w-full flex justify-content-end px-4 py-0 sticky top-0 z-5" :model="blockHeaderItems">
                                <template #item="{ item, props }">
                                    <a class="menu-bar-item" @click="() => handlerMenuItem(item, block)" v-bind="props.action">
                                        <i :class="item.icon"></i>
                                        <span>{{ item.label }}</span>
                                    </a>
                                </template>
                            </Menubar>
                        
                            <editorInBlock 
                            v-if="isShowTextEditor(block)"
                            @update:content="(content) => editorContent = content"
                            @save:content="saveContentBlock"
                            @close="closeTextEditor"
                            :closable="true"
                            :editor-styles="{ height: '100%', width: '100%' }"
                            :initial-value="initEditorContent"
                            :loading="isLoadingSaveContent"
                            />
                            <!-- CONTENT -->
                            <div class="ql-editor px-5 py-3" v-else v-html="blockContent(block.content)">
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, onBeforeUnmount, onMounted } from 'vue';
import { Chapter, ChapterBlock, CreateChapterBlock } from '../../../@types/entities/materials.types';
import editorInBlock from './editorInBlock.vue';
import { ref, type Ref } from 'vue';
import useNotices from '../../../composables/notices';
import CreateBlockForm from './createBlockForm.vue';
import { createChapterBlockApi, editChapterBlockApi } from '../../../api/materials.api';
import { trimPath } from '../../../utils/strings.utils';
import { useMaterialsStore } from '../../../stores/materials.store';
import { MenuItem } from 'primevue/menuitem';
interface Props {
    chapter: Chapter | null;
}
const props = withDefaults(defineProps<Props>(), {

});

const notice = useNotices();
const materialStore = useMaterialsStore();

const workspaceDiv: Ref<null | HTMLDivElement> = ref(null);
const currentBlockId = ref<null | number>(null); 

const isLoadingSaveContent = ref(false);
const isLoadingCreateBlock = ref(false);
const opennedEditTitleBlock = ref<null | number>(null);
const titleBlock = ref('');
const isLoadingEditTitleBlock = ref(false);
const opennedStateEditor = ref({
    blockId: null as null | number,
    isActive: false,
});
const isActiveCreateForm = ref(false);
const contentTitle = ref('');
const isLoadingEditContentTitle = ref(false);
const editorContent: Ref<null | string> = ref(null);
const initEditorContent: Ref<string | null> = ref<string | null>(null);
const blockHeaderItems = ref([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        iconType: 'pi',
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        iconType: 'pi',
    },
])

// Вычислить актуальный контент для блока
const blockContent = computed(() => {
    return (content: string | null) => {
        if(!editorContent.value) return content;
        else return editorContent.value;
    }
})

const blocks = computed(() => {
    if(props.chapter) {
        return props.chapter.content.blocks;
    }
    return [];
});

// Видимость инпута для label блока
const isShowInputBlockTitle = computed(() => {
    return opennedStateEditor.value.isActive === true;
});

const isShowTextEditor = computed(() => {
    return (block: any) => {
        return opennedStateEditor.value.isActive === true && opennedStateEditor.value.blockId === block.id;
    }
});

// Вычисление pathName для операций с сервером
const pathName = computed(() => {
    if(props.chapter && props.chapter.fullpath) {
        return (trimPath(props.chapter.fullpath, { split: true }) as string[])[0];
    }
    else if (props.chapter && props.chapter.pathName) {
        return props.chapter.pathName;
    }
    else return null;
});

// Объект текущего отрытого блока
const currentBlock = computed(() => {
    const block = blocks.value.find((block) => block.id === currentBlockId.value);
    if(!block) throw new Error('currentBlock не существует');
    if(editorContent.value) block.content = editorContent.value;
    return block;
});

// Изменить заголовок content chapter
function editContentTitle() {
    if(contentTitle.value) {
        // запрос на изменение title
        try {
            isLoadingEditContentTitle.value = true;
            console.log('Запрос');
        } finally {
            isLoadingEditContentTitle.value = false;
        }
    }
}

// Активировать текстовый редактор
function openTextEditor() {
    opennedStateEditor.value.blockId = currentBlockId.value;
    opennedStateEditor.value.isActive = true;
    initEditorContent.value = currentBlock.value.content;
}

// Открыть инпут редактирования block title
function openEditTileBlock(blockId: number, title: string) {
    // Если клик по кнопке был и значения переменных уже есть значит функция изменяет title блока
    if(opennedEditTitleBlock.value && titleBlock.value) {
        if(title === titleBlock.value) {
            opennedEditTitleBlock.value = null;
            return void (titleBlock.value = '');
        }
        // Запрос на изменение title у блок
        else {
            try {
                isLoadingEditTitleBlock.value = true;
                console.log('Запрос');
            } finally {
                isLoadingEditTitleBlock.value = false
            }
        }
    } else {
        opennedEditTitleBlock.value = blockId;
        titleBlock.value = title;
    }
}

// Закрыть текстовый редактор
function closeTextEditor() {
    initEditorContent.value = null;
    // editorContent.value = null;
    opennedEditTitleBlock.value = null;
    opennedStateEditor.value = {
        blockId: null,
        isActive: false,
    }
}

function handlerMenuItem(item: MenuItem, block: ChapterBlock) {
    // Выбор режима Редактирование блока
    if(item.label === 'Edit') {
        chooseBlockForEdit(block);
    }
    console.log(item, block);
}
// Выбрать блок для редактирования контента
function chooseBlockForEdit(block: ChapterBlock) {
    opennedStateEditor.value.blockId = block.id;
    initEditorContent.value = blockContent.value(block.content);
    opennedStateEditor.value.isActive = true;
}

// Выбрать блок для удаления
function chooseBlockForDelete() {
    opennedStateEditor.value.blockId = currentBlockId.value;
    opennedStateEditor.value.isActive = true;
}

// Включить форму создания нового блока
function activeCreateForm() {
    isActiveCreateForm.value = true;
}

// Сохранить контент для текущего блока
async function saveContentBlock() {
    try {
        isLoadingSaveContent.value = true;
        if(!pathName.value) throw new Error('[saveContentBlock]>> pathName не существует');
        if(!currentBlock.value) throw new Error('[saveContentBlock]>> currentBlock не существует');
        if (!editorContent.value) {
            return void notice.show({ detail: 'Filled All Data!', severity: 'error' });
        }
        // Запрос на сохранение контента
        const updBlock: ChapterBlock = { ...currentBlock.value, content: editorContent.value };
        const result = await editChapterBlockApi({ 
            block: updBlock, 
            pathName: pathName.value,
            fullpath: props.chapter?.fullpath,
        });
        materialStore.materialChapters = result;
    } catch (err) {
        throw err
    } finally {
        isLoadingSaveContent.value = false;
        closeTextEditor();
    }
}

// Запрос на создание нового блока в разделе/подразделе
async function reqCreateBlockMaterial(data: CreateChapterBlock) {
    try {
        if(!pathName.value) throw new Error('[reqCreateBlockMaterial]>> Chapter pathName не существует');
        isLoadingCreateBlock.value = true;
        if(!data.title || data.title.length < 3) {
            return void notice.show({ detail: 'Title length must be either greater or equal 3', severity: 'error' });
        }
        data.pathName = pathName.value;
        if(props.chapter?.fullpath) data.fullpath = props.chapter?.fullpath; 
        await createChapterBlockApi(data);
        
    } catch (err) {
        console.error(err);
        throw err
    } finally {
        isLoadingCreateBlock.value = false;
    }
}

// обработка нажатия клавиш
function controllerKeys(event: KeyboardEvent) {
    console.log(event);
    if (event.ctrlKey && ['r', 'R', 'к', 'К'].includes(event.key)) {
        // event.preventDefault();
    }
    // Активировать текстовый редактор
    if (event.ctrlKey && ['у', 'У','e', 'E'].includes(event.key)) {
        event.preventDefault();
        openTextEditor();
    }
    // Закрыть Закрыть что-либо
    if (event.key === 'Escape') {
        event.preventDefault();
        if(opennedStateEditor.value.isActive) closeTextEditor();
        else if(currentBlockId.value) currentBlockId.value = null;
    }
    // Ввод
    if(event.ctrlKey && event.key === 'Enter') {
        if(opennedStateEditor.value.isActive) {
            saveContentBlock();
        }
    }
}

onMounted(() => {
    window.addEventListener('keydown', controllerKeys)
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', controllerKeys);
})
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

.wrapper-blocks {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.block-content-wrapper {
    width: 100%;
    height: 800px;
    overflow: auto;
    color: var(--fg-color);
    background-color: var(--materials-chapter-block-bg);
}
</style>