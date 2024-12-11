<template>
    <dialogComp
    :model-value="props.modelValue" 
    @update:model-value="(visible) => emit('update:modelValue', visible)"
    :is-modal="props.isModal"
    >
        <template #header>
            <div class="select-form-header w-full flex justify-content-center">
                <span class="font-bold">Select an icon <span class="header-mark"></span></span>
            </div>
        </template>
        <template #default>
            <div class="select-body" v-if="props.modelValue">
                <svg-icon 
                class="icon-item" 
                v-for="([key, value], idx) in iconsFiltered" 
                :key="key"
                @click="() => emit('select', value)"
                type="mdi" 
                :path="value" 
                ></svg-icon>
            </div>
        </template>
        <template #footer>
            <div class="select-paginator w-full flex justify-content-center align-items-center py-2 px-4">
                <Button rounded icon="pi pi-chevron-left" severity="secondary" size="small" @click="prevPage"/>
                <span class="paginator-info mx-6">
                    <input 
                    @keyup.enter="selectPage" 
                    @blur="selectPage" 
                    @input="updateInpSelectPage"
                    :value="inpPage"
                    class="curr-page-inp"
                    >
                    / {{ totalPages }}
                </span>
                <Button rounded icon="pi pi-chevron-right" severity="secondary" size="small" @click="nextPage"/>
            </div>
        </template>
        
    </dialogComp>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed, ref } from 'vue';
import dialogComp from '../dialogComp.vue';
import * as icons from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';

interface Props {
    modelValue?: boolean;
    isModal?: boolean;
    closeble?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isModal: true,
    closeble: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'select', iconPath: string): void;
}>();

const perPage = ref(70);
const page = ref(1);
const inpPage = ref(1);
const total = computed(() => {
    return Object.keys(icons).length;
});
const totalPages = computed(() => {
    return Math.ceil(total.value / perPage.value);
});

const iconsFiltered = computed(() => {
    const offset = ((page.value || 1) * perPage.value) - perPage.value;
    return Object.entries(icons).slice(offset, offset + perPage.value);
});
// Предыдущая страница
function prevPage() {
    page.value = Math.max(page.value - 1, 1);
    inpPage.value = page.value;
}
// Следующая страница
function nextPage() {
    page.value = Math.min(page.value + 1, totalPages.value);
    inpPage.value = page.value;
}
// Переключение на страницу с инпута
function selectPage() {
    page.value = inpPage.value;
}
// Обработчик ввода в инпут
function updateInpSelectPage(event: InputEvent | Event) {
    const target = event.target as HTMLInputElement;
    if(target.value && +target.value === +target.value) {
        target.value = String(Math.max(1, +target.value));
        target.value = String(Math.min(+target.value, totalPages.value));
        inpPage.value = +target.value;
    }
}

</script>

<style scoped>
.select-form-header {
    padding: 0 2rem;
    padding-right: 2.8rem;
    cursor: move;
}
.select-body {
    width: 800px;
    height: 550px;
    overflow: auto;
    padding: 1rem 3rem;
}
.header-mark {
    color: var(--cf-primary-2);
}
.icon-item {
    width: 60px;
    height: 60px;
    color: var(--cf-primary-2);
    background-color: rgba(0,0,0, .15);
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    margin-left: .8rem;
    margin-bottom: .8rem;
    border-radius: var(--rounded);
}
.icon-item:hover {
    background-color: rgba(0,0,0, .25);
    transition: all 0.1s ease-in;
}
.select-paginator {
    border-top: 1px solid var(--light-text-1);
}

.paginator-info {
    font-family: monospace;
    font-weight: bold;
}
.curr-page-inp {
    width: 2.5rem;   
    padding: .2rem .2rem !important;
    font-weight: bold;
    font-size: 12px;
    background-color: var(--bg-color);
    color: var(--fg-color);
    border: 1px solid var(--light-text-1);
    border-radius: var(--rounded);
    outline: 2px solid var(--rounded);
}
</style>