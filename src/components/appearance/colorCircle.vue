<template>
    <div class="color-circle__overlay">
        <div 
            class="color-circle"
            :class="{ selection: props.selection }"
            :style="{ 
                width: props.size, 
                height: props.size,
                backgroundColor: props.color, 
            }"
            :title="props.title"
        ></div>
        <span 
            v-if="!!props.summary" 
            class="color-circle__summary"
            :class="{ selection: props.selection }"
        >
            {{ props.summary }}
        </span>
    </div>
</template>

<script setup lang="ts">
interface Props {
    color?: string;
    size?: number | string;
    title?: string;
    summary?: string;
    selection?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    color: '#fff',
    size: '50px',
    title: '',
    selection: false,
});

</script>

<style scoped>
.color-circle__overlay {
    width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .4rem;
}
.color-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    transition: all var(--ui-transition-time) ease;
}
.color-circle:hover {
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    opacity: 0.5;
    transition: all var(--ui-transition-time) ease;
}
.color-circle.selection {
    border: 2px solid rgb(236, 201, 132);
}

.color-circle__summary {
    text-align: center;
}

.color-circle__summary.selection {
    font-weight: bolder;
    color: rgb(255, 220, 150);
}
</style>