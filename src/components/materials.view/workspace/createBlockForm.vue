<template>
    <dialogComp 
    :model-value="props.modelValue"
    :is-modal="false"
    @update:model-value="(value) => emit('update:modelValue', value)"
    >
        <template #header>
            <div class="form-header">Create New Block</div>
        </template>
        <template #default>
            <div class="form-body px-6 py-5">
                <div class="w-full flex flex-column gap-1">
                    <label for="block-title-inp">Block Title</label>
                    <InputText id="block-title-inp" v-model="blockTitle" />
                    <Message size="small" severity="secondary" variant="simple">Enter a new block title.</Message>
                </div>
                <Button 
                class="ml-auto"
                label="Submit" 
                severity="info"
                :loading="props.loading" 
                size="small"
                @click="submitForm"
                />
            </div>
            </template>

    </dialogComp>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dialogComp from '../../base/dialogComp.vue';
import { defineEmits, defineProps } from 'vue';

interface Props {
    modelValue?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
});

const blockTitle = ref('');

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'submitForm', data: { title: string }): void;
}>();

function submitForm() {
    emit('submitForm', { title: blockTitle.value });
}


</script>

<style scoped>
.form-header {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
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
</style>