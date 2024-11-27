<template>
    <cToast />
    <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import cToast from './components/base/cToast.vue';
import { useMainStore } from './stores/main.store';

const mainStore = useMainStore();
const appTitle = document.getElementById('app-title') as HTMLTitleElement;

onMounted(() => {
    let readyTitle = '> ';
    for (let i = 0; i < mainStore.appTitle.length; i++) {
        setTimeout(() => {
            const char = mainStore.appTitle[i];
            readyTitle += char;
            if(appTitle.textContent) {
                appTitle.textContent = readyTitle + '_';
            }
        }, i*80);
    }
});
</script>

<style scoped> 
    
</style>