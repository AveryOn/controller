<template>
    <div 
    class="relative" 
    id="editor-container" 
    ref="editor"
    >
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, defineProps, defineEmits, watch, type Ref } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface EditorStyles {
    width?: string;
    height?: string;
}

interface Props {
    initialValue?: string | null;
    placeholder?: string;
    showSave?: boolean;
    editorStyles?: EditorStyles;
}
const props = withDefaults(defineProps<Props>(), {
    showSave: false,
});

const emit = defineEmits<{
    (e: 'update:content', value: any): void;
}>();

const editor: Ref<null | HTMLDivElement> = ref(null);
let quillInstance: any = null;

// вставить существующий html-контент
function pasteHtmlContent() {
    if (quillInstance) {
        quillInstance.clipboard.dangerouslyPasteHTML(props.initialValue);
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
            emit('update:content', formattedContent);
        });
    }
};

// Если существующий контент приходит в редактор по пропсу то вставляем его в редактор
watch(() => props.initialValue, () => {
    pasteHtmlContent();
});

watch(() => props.editorStyles, (newValue) => {
    if(newValue) {
        setSizeEditor(newValue);
    }
}, { deep: true });

// Задать размеры редактору
function setSizeEditor(styles: EditorStyles | undefined) {
    const toolBar = document.querySelector('.ql-toolbar') as HTMLDivElement;
    if(styles && editor.value && toolBar) {
        toolBar.style.width = styles.width || '600px';
        editor.value.style.width = styles.width || '600px';
        editor.value.style.height = styles.height || '300px';
    }
}

onMounted(() => {
    initializeQuill();
    pasteHtmlContent();
    setSizeEditor(props.editorStyles);
});
</script>

<style>
#editor-container {
    position: relative;
}
</style>