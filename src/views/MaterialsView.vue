<template>
    <div class="materials-view">
        Materials Page {{ $route.params }}
        <addChapter v-if="$route.params['chapter'] === 'add-chapter'"/>
    </div>
</template>

<script setup lang=ts>
import addChapter from '../components/materials.view/addChapter.vue';

</script>

<style scoped>
.materials-view {
    width: 100%;
    height: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--bg-color);
    color: var(--fg-color);
}
</style>