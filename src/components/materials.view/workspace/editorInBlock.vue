<template>
    <div 
        class="editor-wrapper gap-2"
        id="editor-wrapper"
    >
        <Button 
        v-if="props.closable"
        class="editor-close-btn" 
        icon="pi pi-times" 
        severity="secondary"
        @click="emit('close')"
        size="small"
        />
        <textEditor
        :initial-value="props.initialValue"
        @update:content="(content: string) => emit('update:content', content)"
        :editor-styles="props.editorStyles"
        :show-save="false"
        />
        <!-- <Button
        class="save-btn px-1" 
        icon="pi pi-check"
        size="small"
        @click="emit('save:content')" 
        :loading="props.loading"
        /> -->
    </div>
</template>

<script setup lang="ts">
import textEditor from '../../base/textEditor.vue';

interface Props {
    loading?: boolean;
    closable?: boolean;
    initialValue: string | null;
    editorStyles: {
        width?: string;
        height?: string;
    };
}
const props = withDefaults(defineProps<Props>(), {
    initialValue: null,
    loading: false,
    closable: false,
});
const emit = defineEmits<{
    (e: 'update:content', content: string): void;
    (e: 'save:content'): void;
    (e: 'close'): void;
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
.editor-close-btn {
    position: absolute;
    right: 1rem;
    top: .6rem;
}
.save-btn {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    margin-left: auto;
}
</style>