<template>
    <div class="editor-wrapper gap-2">
        <textEditor
        :initial-value="props.initialValue"
        @update:content="(content: string) => emit('update:content', content)"
        :editor-styles="props.editorStyles"
        :show-save="false"
        />
        <Button
        class="save-btn px-4" 
        label="Save" 
        @click="emit('save:content')" 
        :loading="props.loading"
        />
    </div>
</template>

<script setup lang="ts">
import textEditor from '../../base/textEditor.vue';

interface Props {
    loading?: boolean;
    initialValue: string | null;
    editorStyles: {
        width?: string;
        height?: string;
    };
}
const props = withDefaults(defineProps<Props>(), {
    initialValue: null,
    loading: false,
});
const emit = defineEmits<{
    (e: 'update:content', content: string): void;
    (e: 'save:content'): void;
}>();

</script>

<style scoped>
.editor-wrapper {
    position: relative;
    width: 100%;
    height: 95%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color);
}
.save-btn {
    margin-left: auto;
    right: 2rem;
}
</style>