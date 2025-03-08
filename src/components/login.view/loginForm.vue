<template>
    <form @submit.prevent class="form pt-3 pb-5">
        <h2 class="mb-4">Login</h2>
        <Fluid class="w-10">
            <div class="flex flex-column gap-3">
                <InputText 
                    size="small" 
                    type="text" 
                    v-model="form.username" 
                    placeholder="Username" 
                />
                <Password 
                    size="small" 
                    v-model="form.password" 
                    placeholder="Password" 
                    :feedback="false" 
                    toggleMask
                />
            </div>
        </Fluid>
        <Button 
            class="w-10 mt-auto" 
            fluid 
            label="Confirm" 
            size="small"
            :loading="isLoading"
            :disabled="!isFilledForm"
            @click="submit"
        />
    </form>
</template>

<script setup lang="ts">
import Fluid from 'primevue/fluid';
import { ref, defineEmits, computed } from 'vue';
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

/**
 * Определяет все ли поля формы заполнены
 */
 const isFilledForm = computed(() => {
    return (
        !!form.value.username &&
        !!form.value.password
    ) 
})

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
