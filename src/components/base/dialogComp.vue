<template>
    <Dialog
    :visible="props.modelValue" 
    @update:visible="(e) => updateModelValue(e)" 
    @hide="() => close()"
    :modal="props.isModal" 
    :closable="false"
    :style="{ 
        minWidth: '25rem', 
        width: 'max-content',
        zIndex: '99999', 
    }"
    >
        <template #header>
            <div class="dialog-header w-full flex align-items-center">
                <slot name="header"></slot>
                <svg-icon 
                class="close-btn" 
                type="mdi" 
                :path="mdiCloseBoxOutline" 
                :size="24"
                @click="close"
                ></svg-icon>
            </div>
        </template>
        <template #default>
            <div class="dialog-content">
                <slot name="default"></slot>
            </div>
        </template>
        <template #footer>
            <div class="dialog-footer">
                <slot name="footer"></slot>
            </div>
        </template>
    <!-- <template #container>
            Content
        </template> -->
    </Dialog>
</template>

<script setup lang="ts">
// @ts-expect-error
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCloseBoxOutline } from '@mdi/js';
interface Props {
    modelValue?: boolean;
    isModal?: boolean;
    closeble?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isModal: true,
    closeble: true,
});

const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void;
    (e: 'close'): void;
}>();

function updateModelValue(active: boolean){
    emit('update:modelValue', active);
}

function close() {
    emit('close')
}

</script>

<style scoped>
.dialog-header {
    position: relative;
    padding: .2rem .1rem;
    border-bottom: 1px solid var(--light-text-1);
}
.close-btn {
    position: absolute;
    right: 0;
    background-color: rgba(0,0,0,0);
    outline: rgba(0,0,0,0);
    color: var(--cf-primary-1);
    font-weight: 600;
    padding: 0;
    height: max-content;
    width: max-content;
    cursor: pointer;
    transition: color 0.3s ease;
}
.close-btn:hover {
    transition: color 0.3s ease;
    color: var(--cf-primary-2);
}
.dialog-content {
    width: 100%;
    height: max-content;
    overflow: hidden;
}
.dialog-footer {
    padding: 0 !important;
    width: 100% !important;
    height: max-content;
    max-height: 20rem;
}
</style>