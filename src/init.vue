<template>
    <div id="titlebar">
        <p id="app-title">
            <span id="prompt">$></span>
            {{ appTitleContent }}
        </p>
        <div class="titlebar-region-drag">
        </div>
        <div class="app-title-btns flex align-items-center">
            <button 
                class="app-title-btn"
                @click="windowMin" 
            >🗕</button>
            <button 
                class="app-title-btn"
                @click="windowMax" 
            >🗖</button>
            <button 
                class="app-title-btn"
                @click="windowClose" 
            >🗙</button>
        </div>
    </div>
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
    <div class="router-overlay">

        <router-view></router-view>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import cToast from './components/base/cToast.vue';
import { useMainStore } from './stores/main.store';
import { useRouter } from 'vue-router';
import { LocalVars } from './@types/main.types';
import { setPalette, setTheme } from './utils/web-api.utils';
import { PalettesKey, ThemesKey } from './@types/ui.types';

const router = useRouter();
const mainStore = useMainStore();
const appTitleContent = ref('_ ')
const isGlobalLoading = ref(true);
interface CurrentRoute {
    name: string;
    query: any;
    params: any;
}

function windowMin() {
    window.electron.windowMin()
}

function windowMax() {
    window.electron.windowMax()
}

function windowClose() {
    window.electron.windowClose()
}

onBeforeMount(() => {
    const currentRoute: CurrentRoute = JSON.parse(localStorage.getItem(LocalVars.currentRoute)!);
    if(currentRoute) {
        router.push({name: currentRoute.name, query: currentRoute.query, params: currentRoute.params});
    }
});
onMounted(() => {
    // Установка темы
    const theme: ThemesKey = localStorage.getItem(LocalVars.theme) as ThemesKey ?? 'light'
    const palette: PalettesKey = localStorage.getItem(LocalVars.palette) as PalettesKey ?? 'purple'
    setTheme(theme)
    setPalette(palette)

    setTimeout(() => {
        isGlobalLoading.value = false;
        let readyTitle = ' ';
        for (let i = 0; i < mainStore.appTitle.length; i++) {
            setTimeout(() => {
                const char = mainStore.appTitle[i];
                readyTitle += char;
                appTitleContent.value = readyTitle + '_';
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

.router-overlay {
    height: calc(100vh - 20px) !important;
}
</style>