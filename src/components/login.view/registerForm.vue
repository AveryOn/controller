<template>
    <form @submit.prevent class="register-form">
        <h2 class="mb-auto">Sign Up</h2>
        <Fluid class="w-10">
            <div class="flex flex-column gap-1">
                <InputText size="small" type="text" v-model="form.username" placeholder="Username" />
                <Password size="small" v-model="form.password" placeholder="Password" :feedback="false" toggleMask />
                <Password size="small" v-model="form.confirmPassword" placeholder="Confirm Password" :feedback="false"
                    toggleMask />
            </div>
        </Fluid>
        <Button class="w-10 mt-3 mb-2" fluid label="Confirm" size="small" :loading="isLoading" @click="submit" />
    </form>
</template>

<script setup lang="ts">
import Fluid from 'primevue/fluid';
import { ref, defineEmits } from 'vue';
import useNotices from '../../composables/notices';
const notices = useNotices();

const emit = defineEmits({
    'confirm:login': (state: boolean) => true,
})

const isLoading = ref(false);
const form = ref({
    username: '',
    password: '',
    confirmPassword: '',
});


// Создание нового аккаунта
async function submit() {
    try {
        isLoading.value = true;
        if (form.value.password === form.value.confirmPassword) {
            const newUser = await window.electron.createUser({
                username: form.value.username,
                password: form.value.password,
            });
            console.log(newUser);
        }
        emit('confirm:login', true);
    } catch (error) {
        notices.show({ severity: 'error', detail: 'Error' });
    }
    finally {
        isLoading.value = false;
        form.value = {
            username: '',
            password: '',
            confirmPassword: '',
        }
    }

}
</script>

<style scoped>
.register-form {
    width: 400px;
    height: max-content;
    background-color: rgb(222, 222, 222);
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}
</style>