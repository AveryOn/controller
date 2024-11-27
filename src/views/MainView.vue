<template>
    <div class="main-view">
        <cPanelMenu />
        <main class="main-panel">
            <router-view v-slot="{ Component }">
                <component class="route-comp" :is="Component"></component>
            </router-view>
        </main>
    </div>
</template>

<script setup lang="ts">
import cPanelMenu from '../components/main.view/cPanelMenu.vue';

async function getUsers() {
    console.log(await window.electron.getUsers({ perPage: 1, page: 2 }));
}
</script>

<style scoped>
.main-view {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: stretch;
    background-color: var(--bg-color);
    color: var(--fg-color);
}
.main-panel {
    width: 80%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.route-comp {
    height: 100% !important;
    margin-bottom: auto;
}
</style>