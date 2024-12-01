<template>
    <dialogComp 
    :model-value="props.modelValue" 
    @update:model-value="(visible) => emit('update:modelValue', visible)" 
    :is-modal="false"
    >
        <template #header>
            <div class="subchapter-form-header w-full flex justify-content-center">
                <span class="font-bold">Add New Subchapter</span>
            </div>
        </template>
        <template #default>
            <addChapter 
            @submit-form="(data) => emit('submitForm', data)" 
            :loading="props.loading"
            form-type="return" 
            />
        </template>
    </dialogComp>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import dialogComp from '../../base/dialogComp.vue';
import addChapter from '../addChapter.vue';
import { ChapterCreate } from '../../../@types/entities/materials.types';

interface Props {
    modelValue?: boolean;
    isModal?: boolean;
    closeble?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isModal: true,
    closeble: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'submitForm', chapter: ChapterCreate): void;
}>();

</script>

<style scoped>
.subchapter-form-header {
    cursor: move;
}
</style>