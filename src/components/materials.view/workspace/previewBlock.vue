<template>
    <dialogComp 
    class="dialog"
    :model-value="props.modelValue"
    :is-modal="true"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @close="emit('close')"
    >
        <template #header>
            <div class="form-header">
                {{ props.block?.title }}
            </div>
        </template>
        <template #default>
            <div class="block-body">
                
                <div class="block-body__content">
                    <ProgressBar 
                        v-if="isLoadingBlock" 
                        mode="indeterminate" 
                        style="height: 3px"
                    ></ProgressBar>

                    <editorInBlock 
                        v-if="props.isActiveEditor"
                        :editor-styles="{ height: '100%', width: '100%' }" 
                        :initial-value="initEditorContent"
                        :closable="false"
                        @update:content="(content) => console.log('update:content', content)" 
                        @save:content="() => console.log('save:content')"
                        @close="() => console.log('close')" 
                    />
                    <div v-else v-html="content"></div>
                </div>

                <div class="body-actions">
                    <Button 
                        icon="pi pi-save" 
                        icon-pos="left" 
                        variant="outlined"
                        size="small"
                        label="Save" 
                        :loading="props.loading"
                        @click="emit('save', content)"
                    />
                </div>
            </div>
        </template>
    </dialogComp>
</template>

<script setup lang="ts">
import { BlockMeta } from '../../../@types/entities/materials.types';
import { defineEmits, defineProps, onBeforeMount, onMounted, type Ref, ref } from 'vue';
import dialogComp from '../../base/dialogComp.vue';
import editorInBlock from './editorInBlock.vue';
import { materialsRouter } from '../../../stores/materials.store';
import { getOneBlockApi } from '../../../api/materials.api';


interface Props {
    modelValue?: boolean;
    loading?: boolean;
    block: BlockMeta | null;
    isActiveEditor: boolean
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'save', data: string): void;
    (e: 'close'): void;
}>();

const isLoadingBlock = ref(false)
const content = ref('') 
const initEditorContent: Ref<string | null> = ref<string | null>(null);

onBeforeMount(async () => {
    materialsRouter.subscribe('blockId', async ({ blockId }) => {
        if (blockId.value) {
            try {
                isLoadingBlock.value = true
                const block = await getOneBlockApi({ id: blockId.value })
                if (block) {
                    content.value = block.content ?? ''
                }
            }
            finally {
                isLoadingBlock.value = false
            }

        }
        else {
            content.value = ''
            initEditorContent.value = ''
        }
    })
})

</script>

<style scoped>
.dialog {
    width: 90% !important;
}
.form-header {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0 1rem;
    cursor: move;
    font-weight: bolder;
}
.form-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 400px;
    height: max-content;
}
.block-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 95vw !important;
    height: 90vh !important;
}
.block-body__content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 0.5rem 3rem;
}

.body-actions {
    width: 100%;
    padding: 0.3rem 2rem;
    border-top: 1px solid var(--border-color-1);
    display: flex;
    justify-content: flex-end;
}
</style>