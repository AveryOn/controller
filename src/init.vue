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
import { onBeforeMount, onMounted, ref } from 'vue';
import cToast from './components/base/cToast.vue';
import { useMainStore } from './stores/main.store';
import { useRouter } from 'vue-router';
import { LocalVars } from './@types/main.types';

const router = useRouter();
const mainStore = useMainStore();
const appTitle = document.getElementById('app-title') as HTMLTitleElement;
const isGlobalLoading = ref(true);
interface CurrentRoute {
    name: string;
    query: any;
    params: any;
}

onBeforeMount(() => {
    const currentRoute: CurrentRoute = JSON.parse(localStorage.getItem(LocalVars.currentRoute)!);
    if(currentRoute) {
        router.push({name: currentRoute.name, query: currentRoute.query, params: currentRoute.params});
    }
});
onMounted(() => {
    setTimeout(() => {
        isGlobalLoading.value = false;
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
    }, 1000);
});
</script>

<style scoped> 
.global-loading-overlay {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    top: 20px;
    background-color: var(--bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999 !important;
} 
</style>