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
                        <span v-else="item.iconType === 'pi'" class="item-icon" :class="item.icon" />
                        <span class="item-label ml-2">{{ item.label }}</span>
                        <span v-if="item.items" class="pi pi-angle-down text-primary ml-auto" />
                    </a>
                </router-link>
            </template>
        </PanelMenu>
    </aside>
</template>

<script setup lang="ts">
import { mdiVuejs } from '@mdi/js';
import { ref } from 'vue';
import cIcon from '../base/cIcon.vue';

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
        command: () => {
        },
        items: [
            // {
            //     label: 'Frontend',
            //     icon: 'pi pi-trash',
            //     command: (e: any) => {
            //         console.log('Hello', e);
            //     },
            //     items: [
            //         {
            //             label: 'Vue',
            //             icon: mdiVuejs,
            //             iconType: 'mdi',
            //         }
            //     ]
            // },
            // {
            //     label: 'Backend',
            //     icon: 'pi pi-code',
            //     route: 'materials',
            //     pathName: 'backend',
            // },
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
    display: inline-flex;
    align-items: center;
}
</style>