<template>
    <aside class="panel-menu">
        <PanelMenu class="w-full h-full" :model="mainStore.menuPanelItems">
            <template #item="{ item }">
                <div
                :id="materialsStore.createMaterialElementId(item)"
                class="inner-item flex items-center cursor-pointer px-2 py-1"
                @click="() => selectItem(item)"
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
                    <span 
                    v-if="isShowMaterialsIcon(item).show" 
                    class="text-primary ml-auto" 
                    :class="isShowMaterialsIcon(item).icon"
                    />
                </div>

            </template>
        </PanelMenu>
    </aside>
</template>

<script setup lang="ts">
import cIcon from '../base/cIcon.vue';
import { useRouter } from 'vue-router';
import { replacePathForMaterials } from '../../utils/strings.utils';
import { useMainStore } from '../../stores/main.store';
import { computed } from 'vue';
import { useMaterialsStore } from '../../stores/materials.store';
import { materialsRouter } from '../../stores/materials.store';

const router = useRouter();
const mainStore = useMainStore();
const materialsStore = useMaterialsStore();

const isShowMaterialsIcon = computed(() => {
    return (item: any) => {
        if(item.route === 'materials') {
            if(item.meta === true) return { show: true, icon: 'xxx' }
            if(item.items) {
                let icon = 'pi pi-folder-plus'
                if(item.items.length > 0) icon = 'pi pi-folder-open';
                return { show: true, icon };
            }
            else return { show: true, icon: 'pi pi-file' }
        }
        else return { show: true, icon: 'pi pi-angle-down' }
    }
})

// Когда выбираем какой-либо элемент меню
function selectItem(item: any) {
    if(item.route === 'materials') {
        let querySubChapter: string | undefined = undefined; 
        if(item.pathName || item.fullLabels) {
            materialsStore.updateMaterialsFullLabels(item.fullLabels ?? [item.label]);
            
            materialsRouter.setState({
                chapter: item?.pathName ?? null,
                subChapter: item?.fullpath ?? null,
                materialUid: `${item?.pathName ?? 'void'}---${item?.fullpath ?? 'void'}`,
                materialType: materialsStore.determineMaterialType(item),
            })
        }
        
        if(item.fullpath) {
            querySubChapter = replacePathForMaterials(item.fullpath);
        }
        router.push({ 
            name: item.route, 
            params: { chapter: item.pathName }, 
            query: { subChapter: querySubChapter },
        });
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
    display: flex;
    align-items: center;
    user-select: none;
}
.item-icon {
    color: var(--cf-primary-2);
    font-size: .9rem !important;
    height: max-content !important;
}
.mdi-icon-type {
    color: var(--cf-primary-2);
}
.item-label {
    width: 100%;
    border-left: var(--panel-border);
    padding-left: 0.5rem;
    border-left-style: solid;
    border-width: 2px;
    display: inline-flex;
    align-items: center;
}
</style>