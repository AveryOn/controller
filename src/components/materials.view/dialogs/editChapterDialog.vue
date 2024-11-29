<template>
    <dialogComp 
    :model-value="props.modelValue" 
    @update:model-value="(visible) => emit('update:modelValue', visible)" 
    :is-modal="false"
    >
        <template #header>
            <div class="subchapter-form-header w-full flex justify-content-center">
                <span class="font-bold">Edit the Chapter <span class="header-mark">{{ props.chapterLabel }}</span></span>
            </div>
        </template>
        <template #default>
            <div class="chapter-editor-body">
                <div class="body-actions flex justify-content-center gap-4 pt-5 pb-3">
                    EDITOR
                </div>
            </div>
        </template>
    </dialogComp>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import dialogComp from '../../base/dialogComp.vue';

interface Props {
    modelValue?: boolean;
    isModal?: boolean;
    closeble?: boolean;
    chapterLabel: string | undefined; 
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isModal: true,
    closeble: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'confirm'): void;
}>();

</script>

<style scoped>
.subchapter-form-header {
    padding: 0 2rem;
    padding-right: 2.8rem;
    cursor: move;
}
.chapter-editor-body {
    min-width: 400px;
    width: max-content;
}
.header-mark {
    color: var(--cf-primary-2);
}
</style>