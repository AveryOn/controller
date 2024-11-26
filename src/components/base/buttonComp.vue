<template>
    <Button class="button">
        <slot></slot>
    </Button>
</template>

<script setup lang="ts">
import { Button } from 'primevue';

</script>

<style scoped>
.button {
    font-family: monospace;
}
</style>