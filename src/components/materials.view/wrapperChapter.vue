<template>
    <div class="wrapper-material-chapter">
        <Menubar class="w-full" :model="items" />
        <h2 class="not-data-note" v-show="blocks.length === 0">
            Empty
        </h2>
        <div class="wrapper-blocks px-4 py-2" v-show="blocks.length > 0">
            <article
            class="data-block" 
            v-for="block in blocks" 
            :key="block.id"
            >
                article {{ block.id }}
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router';
import { getOneChapter } from '../../api/materials.api';
import { computed, ref, type Ref } from 'vue';
import { Chapter } from '../../@types/entities/materials.types';

const opennedChapter: Ref<Chapter | null> = ref(null);
    const items = ref([
    {
        label: 'New Block',
        icon: 'pi pi-plus',
    },
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
    },
]);
const emit = defineEmits<{
    (e: 'openChapter', label: string): void;
}>();

const blocks = computed(() => {
    if(opennedChapter.value) {
        return opennedChapter.value.content.blocks;
    }
    return [/* {id: 1}, {id: 2}, {id:3} */];
})

onBeforeRouteUpdate( async (to, from, next) => {
    // Запрос на получение данных раздела в случае его выбора
    const prevChapter = from.params['chapter'] as string;
    const nextChapter = to.params['chapter'] as string;
    if( nextChapter && nextChapter !== prevChapter) {
        opennedChapter.value = await getOneChapter({ pathName: nextChapter });
        emit('openChapter', opennedChapter.value.label);
    }
    next();
});


</script>
<style scoped>
.wrapper-material-chapter {
    width: 100%;
    height: 98vh !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    overflow: hidden !important;
}
.not-data-note {
    font-family: var(--font);
    color: var(--light-text-3);
    margin: auto;
    user-select: none;
}
.wrapper-blocks {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.data-block {
    width: 100%;
    height: 600px;
    flex: 0 0 auto;
    border: 1px solid red; 
}
</style>