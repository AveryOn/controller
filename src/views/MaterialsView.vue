<template>
    <div class="materials-view">
        <header class="materials-header">
            <span class="flex">Materials {{ openChapterName }}</span> 
        </header>
        <div class="materials-main">
            <addChapter v-show="$route.params['chapter'] === 'add-chapter'"/>
            <wrapperChapter 
            v-show="$route.params['chapter'] !== 'add-chapter' && $route.params['chapter']" 
            @open-chapter="(label) => labelChapter = label"
            @quit="labelChapter = null"
            />
        </div>
    </div>
</template>

<script setup lang=ts>
import { computed, ref, type Ref } from 'vue';
import addChapter from '../components/materials.view/addChapter.vue';
import wrapperChapter from '../components/materials.view/wrapperChapter.vue';

const labelChapter: Ref<string | null> = ref(null);

const openChapterName = computed(() => {
    if(labelChapter.value !== 'add-chapter') {
        if(labelChapter.value) return `> ${labelChapter.value}`;
        else return '';
    }
    else return '> New Chapter';
});
</script>

<style scoped>
.materials-view {
    width: 100%;
    height: 100%;
    height: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--bg-color);
    color: var(--fg-color);
}
.materials-header {
    width: 100%;
    height: max-content;
    display: flex;
    justify-content: center;
    font-family: var(--font);
    background-color: var(--materials-header-bg);
    color: var(--materials-header-fg);
    font-weight: bolder;
}
.materials-main {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>