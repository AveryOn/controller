<template>
    <form @submit.prevent class="login-form">
        <h2 class="mb-auto">Login</h2>
        <Fluid class="w-10">
            <div class="flex flex-column gap-1">
                <InputText size="small" type="text" v-model="form.username" placeholder="Username" />
                <Password size="small" v-model="form.password" placeholder="Password" :feedback="false" toggleMask/>
            </div>
        </Fluid>
        <Button 
        class="w-10 mt-auto mb-2" 
        fluid 
        label="Confirm" 
        size="small"
        :loading="isLoading"
        @click="submit"
        />
    </form>
</template>

<script setup lang="ts">
import Fluid from 'primevue/fluid';
import { ref, defineEmits } from 'vue';

const emit = defineEmits({
    'confirm:login': (data) => true,
})

const isLoading = ref(false);
const form = ref({
    username: '',
    password: '',
});


function submit() {
    emit('confirm:login', form.value.password);
}
</script>

<style scoped>
.login-form {
    width: 400px;
    height: 200px;
    background-color: rgb(222, 222, 222);
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}
</style>