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
import useNotices from '../../composables/notices';
import { useLoginStore } from '../../stores/login.store';
import { LoginResponseApi } from '../../@types/entities/user.types';

const notices = useNotices();
const loginStore = useLoginStore();

const emit = defineEmits({
    'confirm:login': (data: boolean, token: string | null) => true,
});

const isLoading = ref(false);
const form = ref({
    username: '',
    password: '',
});


async function submit() {
    if(!form.value.username || !form.value.password) {
        return void notices.show({ detail: 'Error', severity: 'error' });
    }
    try {
        isLoading.value = true;
        const { token, user }: LoginResponseApi = await window.electron.loginUser({...form.value});
        loginStore.setCredentials(token, user);
        emit('confirm:login', true, token);
        form.value = {
            password: '',
            username: '',
        }
    } catch (err) {
        emit('confirm:login', false, null);
        notices.show({ detail: 'Error', severity: 'error' });
        throw err;
    } finally {
        isLoading.value = false;
    }
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