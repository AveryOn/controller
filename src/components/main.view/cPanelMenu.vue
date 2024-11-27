<template>
    <aside class="panel-menu">
        <PanelMenu class="w-full h-full" :model="items">
            <template #item="{ item }">
                <router-link v-slot="{ href, navigate }" :to="{ name: item.route, params: { chapter: item.pathName} }" custom>
                    <a
                    class="inner-item flex items-center cursor-pointer px-2 py-1"
                    :href="href" 
                    @click="navigate"
                    >
                        <cIcon v-if="item.iconType === 'mdi'" class="mdi-icon-type" :icon="item.icon" :size="20"/>
                        <span v-else="item.iconType === 'pi'" v-show="item.type !== 'loading'" class="item-icon" :class="item.icon" />
                        <span class="item-label ml-2">
                            {{ item.label }}
                            <ProgressSpinner
                            class="ml-auto"
                            v-if="item.type === 'loading'"
                            style="width: 16px; height: 16px" 
                            strokeWidth="4" 
                            fill="transparent"
                            animationDuration=".5s" 
                            aria-label="Custom ProgressSpinner" 
                            />
                        </span>
                        <span v-if="item.items" class="pi pi-angle-down text-primary ml-auto" />
                    </a>
                </router-link>
            </template>
        </PanelMenu>
    </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import cIcon from '../base/cIcon.vue';
import { getChapters } from '../../api/materials.api';
import { useMainStore } from '../../stores/main.store';

const mainStore = useMainStore();
const isLoadingMaterials = ref(false);

const items = ref([
    {
        label: 'Applications',
        icon: 'pi pi-th-large',
        items: [
            {
                label: 'Projects',
                icon: 'pi pi-file',
                route: ''
            },
            {
                label: 'Secrets',
                icon: 'pi pi-key',
                route: ''
            }
        ]
    },
    {
        label: 'Materials',
        icon: 'pi pi-book',
        route: 'materials',
        command: () => getMaterials(),
        items: [
            {
                type: 'loading',
            },
            {
                label: 'Add Chapter',
                icon: 'pi pi-plus',
                route: 'materials',
                pathName: 'add-chapter',
            },
        ]
    },
    {
        label: 'Settings',
        icon: 'pi pi-cog',
        items: [
            {
                label: 'Apperiance',
                icon: 'pi pi-image',
            },
            {
                label: 'Security',
                icon: 'pi pi-shield',
            }
        ]
    }
]);

async function getMaterials() {
    try {
        isLoadingMaterials.value = true;
        if(!mainStore.materialChaptersMenu.length) {
            mainStore.materialChaptersMenu = await getChapters();
        }
        let materials: any = items.value[1];
        if(materials.items && materials.items.slice(0, -2).length <= 0) {
            const addedItem = materials.items.pop();
            materials.items.length = 0;
            materials.items.push(...mainStore.materialChaptersMenu, addedItem);
            console.log(materials.items);
        }
    } catch (err) {
        throw err;
    }
    finally {
        isLoadingMaterials.value = false;
    }
}
</script>

<style scoped>
.panel-menu {
    width: 20% !important;
    gap: 0.3rem !important;
    padding: 0.3rem !important;
    border-right: var(--panel-border);
    font-weight: 600;
}
.inner-item {
    text-decoration: none;
    color: var(--light-text-4);
    background-color: rgba(0,0,0,0);
}
.item-icon {
    border-right: var(--panel-border);
    border-width: 2px;
    padding-right: 0.5rem;
    border-right-style: solid;
    color: var(--cf-primary-2);
    font-size: 1rem !important;
}
.mdi-icon-type {
    color: var(--cf-primary-2);
}
.item-label {
    width: 100%;
    display: inline-flex;
    align-items: center;
}
</style>