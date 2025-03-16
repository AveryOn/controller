<template>
    <dialogComp 
    :model-value="props.modelValue"
    :is-modal="true"
    @update:model-value="(value) => emit('update:modelValue', value)"
    >
        <template #header>
            <div class="form-header">

            </div>
        </template>
        <template #default>
            <div class="block-delete-body">
                <div class="body-actions flex justify-content-center gap-4 pt-5 pb-3">
                    <Button 
                        icon="pi pi-trash" 
                        icon-pos="right" 
                        outlined 
                        severity="danger" 
                        size="small"
                        label="Yes" 
                        :loading="props.loading"
                        @click="emit('save', content)"
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
import dialogComp from '../../base/dialogComp.vue';
import { defineEmits, defineProps, onMounted, ref } from 'vue';

interface Props {
    modelValue?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'save', data: string): void;
}>();

const content = ref('') 

onMounted(() => {
    // 
})

</script>

<style scoped>
.form-header {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 800px;
    padding: 0 1rem;
    cursor: move;
}
.form-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 400px;
    height: max-content;
}
.block-delete-body {
    min-width: 400px;
    width: max-content;
}
</style>