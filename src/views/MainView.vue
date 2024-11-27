<template>
    <div class="main-view">
        <Button label="Login Page" size="small" @click="$router.push({ name: 'login' })"/>
        <Button label="GET" size="small" @click="getUsers"/>
        <h1>Main View</h1>
    </div>
</template>

<script setup lang="ts">

async function getUsers() {
    console.log(await window.electron.getUsers({ perPage: 3, page: 2 }));
}
</script>

<style scoped>
.main-view {
    width: 100vw;
    height: 100vh;
    background-color: var(--bg-color);
    color: var(--fg-color);
}
</style>