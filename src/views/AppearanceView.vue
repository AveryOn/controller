<template>
    <div class="appearance-view">
        <header class="appearance-header">
            <span class="flex head-label">Appearance</span> 
            <!-- <svg-icon class="close-btn" type="mdi" :path="mdiCloseBoxOutline" :size="18" @click="toDefaultPage"></svg-icon> -->
        </header>
        <main class="appearance-main">

            <!-- Блок выбора темы -->
            <div class="select-color-block flex flex-column align-items-center gap-4">
                <h2>Select a Theme</h2>
                <div class="flex align-items-stretch">
                    <colorCircle
                        class="mb-auto"
                        v-for="item in themes" 
                        @click="() => selectTheme(item.code)"
                        :color="item.color"
                        :key="item.code"
                        :title="item.title"
                        :summary="item.title"
                        :selection="Themes[currentTheme!] === Themes[item.code]"
                    />
                </div>
            </div>
            <span class="splitter"></span>

            <!-- Блок выбора цветовой палитры -->
            <div class="select-color-block flex flex-column align-items-center gap-4">
                <h2>Select a Color Palette</h2>
                <div class="flex align-items-stretch">
                    <colorCircle
                        class="mb-auto"
                        v-for="item in palettes" 
                        @click="() => selectColorPalette(item.code)"
                        :color="item.color"
                        :key="item.code"
                        :title="item.title"
                        :summary="item.title"
                        :selection="Palettes[currentPalette!] === Palettes[item.code]"
                    />
                </div>
            </div>

        </main>
    </div>
</template>

<script setup lang=ts>
import colorCircle from '../components/appearance/colorCircle.vue';
import { onMounted, reactive, ref } from 'vue';
//@ts-expect-error
import SvgIcon from '@jamescoyle/vue-icon';
import { Palettes, PalettesKey, Themes, ThemesKey } from '../@types/ui.types';
import { LocalVars } from '../@types/main.types';
import { setPalette, setTheme } from '../utils/web-api.utils';

type ThemeItem = { title: string, code: ThemesKey, color: string }
type PaletteItem = { title: string, code: PalettesKey, color: string }

const themes = reactive<ThemeItem[]>([
    { title: 'Light', code: 'light', color: '#fff' },
    { title: 'Dark', code: 'dark', color: '#2C2C2C' },
    { title: 'Dark Contrast', code: 'darkContrast', color: '#000' },
])

const palettes = reactive<PaletteItem[]>([
    { title: 'Red', code: 'red', color: '#D17777' },
    { title: 'Purple', code: 'purple', color: '#B377D1' },
])

const currentTheme = ref<ThemesKey | null>(null);
const currentPalette = ref<PalettesKey | null>(null);

/**
 * Переключить цветовую схему
 */
function selectColorPalette(code: PalettesKey) {
    setPalette(code)
    localStorage.setItem(LocalVars.palette, code)
    currentPalette.value = code
}
/**
 * Переключить тему
 */
function selectTheme(code: ThemesKey) {
    setTheme(code)
    localStorage.setItem(LocalVars.theme, code)
    currentTheme.value = code
}


onMounted(() => {
    currentTheme.value = localStorage.getItem(LocalVars.theme) as ThemesKey
    currentPalette.value = localStorage.getItem(LocalVars.palette) as PalettesKey
    console.log('currentTheme', currentTheme.value);
    console.log('currentPalette', currentPalette.value);
})

</script>

<style scoped>
.appearance-view {
    width: 100%;
    height: 100%;
    height: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--bg-color);
    color: var(--fg-color);
}
.appearance-header {
    position: relative;
    width: 100%;
    height: max-content;
    overflow: hidden;
    display: flex;
    justify-content: center;
    font-family: var(--font);
    background-color: var(--materials-header-bg);
    color: var(--materials-header-fg);
    font-weight: bolder;
}
.close-btn {
    position: absolute;
    right: 1rem;
    top: 0;
    background-color: rgba(0,0,0,0);
    outline: rgba(0,0,0,0);
    color: var(--materials-header-fg);
    font-weight: 600;
    padding: 0;
    height: max-content;
    width: max-content;
    cursor: pointer;
    transition: color 0.3s ease;
}
.close-btn:hover {
    transition: color 0.3s ease;
    color: var(--materials-header-fg);
}

.head-label {
    user-select: none;
}
.appearance-main {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    gap: 2rem;
    padding: 3rem 0 0 0;
}

.splitter {
    width: 30% !important;
    border-top: 1px solid var(--border-color-1);
}

.select-color-block {
    width: 50%;
    min-height: 100px;
    height: max-content;
}
</style>