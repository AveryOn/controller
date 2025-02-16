import { defineStore } from "pinia";
import { computed, type Ref, ref } from "vue";
import { useMaterialsStore } from "./materials.store";
import { MenuItem } from "primevue/menuitem";

export const useMainStore = defineStore('mainStore', () => {
    const materialStore = useMaterialsStore();
    const appTitle: Ref<string> = ref('controller'); 

    // Элементы панели меню
    const menuPanelItems = computed(() => {
        return [
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
                // route: 'materials',
                command: materialStore.getMaterialsMenu,
                items: materialStore.materialChaptersMenu
            },
            {
                label: 'Settings',
                icon: 'pi pi-cog',
                items: [
                    {
                        label: 'Appearance',
                        icon: 'pi pi-image',
                    },
                    {
                        label: 'Security',
                        icon: 'pi pi-shield',
                    }
                ]
            }
        ] as MenuItem[];
    })
    return {
        appTitle,
        menuPanelItems,
    }
});