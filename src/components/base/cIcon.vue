<template>
    <svg-icon 
    :size="props.size || 25"
    type="mdi" 
    :path="props.icon"
    ></svg-icon>
</template>

<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';

const props = defineProps<{
    icon: string | undefined;
    size?: number;
}>()

</script>

<style scoped>
    
</style>