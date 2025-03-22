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
                    <!-- 
                    v-if="isShowTextEditor(block)"
                    @update:content="(content) => editorContent = content" 
                    @save:content="saveContentBlock"
                    @close="closeTextEditor" :closable="true"
                    :editor-styles="{ height: '100%', width: '100%' }" 
                    :initial-value="initEditorContent"
                    :loading="isLoadingSaveContent"  
                    -->
                    <editorInBlock 
                        v-if="props.isActiveEditor"
                        :editor-styles="{ height: '95%', width: '100%' }" 
                        :initial-value="initEditorContent"
                        :closable="false"
                    />
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
import { defineEmits, defineProps, onMounted, type Ref, ref } from 'vue';
import dialogComp from '../../base/dialogComp.vue';
import editorInBlock from './editorInBlock.vue';


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

const content = ref('') 
const initEditorContent: Ref<string | null> = ref<string | null>(null);

onMounted(() => {
    // 
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