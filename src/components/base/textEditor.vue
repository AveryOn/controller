<template>
    <div class="relative shadow-2" style="border: 1px dashed var(--ui-border-color);">
        <div class="relative" id="editor-container" ref="editor"></div>
        <Button
        v-if="props.showSave"
        class="absolute" 
        style="bottom: 1rem; right: 1rem;" 
        icon="pi pi-save" 
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, defineEmits, watch } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const props = defineProps({
    initialContent: {
        type: String,
        required: false,
    },
    placeholder: {
        type: String,
        required: false,
    },
    showSave: {
        type: Boolean,
        default: false,
        required: false,
    }
});
const emit = defineEmits(['update:modelValue'])

const editor = ref(null);
let quillInstance: any = null;

// вставить существующий html-контент
function pasteHtmlContent() {
    if (quillInstance) {
        quillInstance.clipboard.dangerouslyPasteHTML(props.initialContent);
    }
};

// Инициализация Quill при монтировании компонента
const initializeQuill = () => {
    if (editor.value) {
        quillInstance = new Quill(editor.value, {
            theme: 'snow', // Тема редактора,
            placeholder: props.placeholder,
            modules: {
                syntax: true,  
                toolbar: [
                    { 'header': [1, 2, 3, 4, 5, 6] }, 
                    { 'font': [] }, 
                    { 'size': ['small', false, 'large', 'huge'] },
                    { 'color': [] }, { 'background': [] },
                    'bold', 'italic', 'underline', 'strike', 'code-block',
                    { 'align': [] },
                    { 'list': 'bullet' }, { 'list': 'ordered' },
                    { 'script': 'sub' }, { 'script': 'super' },
                    { 'indent': '-1' }, { 'indent': '+1' },
                    { 'direction': 'rtl' }, 'link', 'image', 'video', 'clean',
                    
                ],
            }
        });

        // Слушатель события изменения контента
        quillInstance.on('text-change', () => {
            // Удаление тега select для итогового html контента (тег select накладывается когда происходит форматрование кода)
            let content = quillInstance.root.innerHTML;
            const regex = /<select\b[^>]*>[\s\S]*?<\/select>/g;
            const formattedContent = content.split(regex).join('');
            emit('update:modelValue', formattedContent);
        });
    }
};

// Если существующий контент приходит в редактор по пропсу то вставляем его в редактор
watch(() => props.initialContent, () => {
    pasteHtmlContent();
})

onMounted(() => {
    initializeQuill();
});

</script>

<style>
#editor-container {
    height: 300px;
}
</style>