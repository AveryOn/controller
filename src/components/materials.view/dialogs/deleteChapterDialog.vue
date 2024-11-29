<template>
    <dialogComp 
    :model-value="props.modelValue" 
    @update:model-value="(visible) => emit('update:modelValue', visible)" 
    :is-modal="false"
    >
        <template #header>
            <div class="subchapter-form-header w-full flex justify-content-center">
                <span class="font-bold">Are you want to delete this chapter?</span>
            </div>
        </template>
        <template #default>
            <div class="chapter-delete-body">
                <div class="body-actions flex justify-content-center gap-4 pt-5 pb-3">
                    <Button 
                    icon="pi pi-trash" 
                    icon-pos="right" 
                    outlined 
                    severity="danger" 
                    size="small"
                    label="Yes" 
                    @click="emit('delete')"
                    />
                    <Button 
                    icon="pi pi-times" 
                    icon-pos="right" 
                    outlined 
                    severity="info" 
                    size="small"
                    label="No" 
                    @click="emit('update:modelValue', false)"
                    />
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
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isModal: true,
    closeble: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'delete'): void;
}>();

</script>

<style scoped>
.subchapter-form-header {
    padding: 0 2rem;
    padding-right: 2.8rem;
    cursor: move;
}
.chapter-delete-body {
    min-width: 400px;
    width: max-content;
}
</style>