<template>
    <Toast position="bottom-right" group="br">
        <template #container="{ message }">
            <div class="p-2">{{ message.detail }}</div>
        </template>
    </Toast>
</template>

<script setup lang="ts">

</script>

<style scoped>
    
</style>