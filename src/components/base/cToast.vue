<template>
    <Toast position="top-right" group="tr">
        <template #container="{ message }">
            <div class="p-2">
                <h2 class="toast-detail">{{ message.detail }}</h2>
            </div>
        </template>
    </Toast>
</template>

<script setup lang="ts">

</script>

<style scoped>
.toast-detail {
    font-family: var(--font);
    font-size: .8rem;
}
</style>