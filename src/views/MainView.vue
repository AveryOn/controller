<template>
    <div class="main-view">
        <cPanelMenu />
        <main class="main-panel">
            <h1>Main View</h1>
            <router-view></router-view>
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

</style>