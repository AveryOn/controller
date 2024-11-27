<template>
    <span v-show="isGlobalLoading" class="global-loading-overlay">
        <ProgressSpinner 
        style="width: 50px; height: 50px" 
        strokeWidth="4" 
        fill="transparent"
        animationDuration=".7s" 
        aria-label="Custom ProgressSpinner" 
        />
    </span>
    <cToast />
    <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import cToast from './components/base/cToast.vue';
import { useMainStore } from './stores/main.store';

const mainStore = useMainStore();
const appTitle = document.getElementById('app-title') as HTMLTitleElement;
const isGlobalLoading = ref(true);

onMounted(() => {
    setTimeout(() => {
        isGlobalLoading.value = false;
    }, 1000);
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
.global-loading-overlay {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    top: 0;
    background-color: var(--bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
} 
</style>