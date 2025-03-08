<template>
    <form @submit.prevent class="form pt-3 pb-5">
        <h2 class="mb-4">Sign Up</h2>
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
                <Password 
                    size="small" 
                    v-model="form.confirmPassword" 
                    placeholder="Confirm Password" 
                    :feedback="false"
                    toggleMask 
                />
            </div>
        </Fluid>
        <Button 
            class="w-10 mt-5" 
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
import { createUserApi } from '../../api/users.api';
const notices = useNotices();

const emit = defineEmits({
    'confirm:register': (state: boolean) => true,
})

const isLoading = ref(false);
const form = ref({
    username: '',
    password: '',
    confirmPassword: '',
});

/**
 * Определяет все ли поля формы заполнены
 */
const isFilledForm = computed(() => {
    return (
        !!form.value.username &&
        !!form.value.password &&
        !!form.value.confirmPassword
    ) 
})


// Создание нового аккаунта
async function submit() {
    try {
        if(!isFilledForm.value) {
            return;
        }
        isLoading.value = true;
        if (form.value.password === form.value.confirmPassword) {
            const newUser = await createUserApi({ 
                username: form.value.username,
                password: form.value.password, 
            })
            form.value = {
                username: '',
                password: '',
                confirmPassword: '',
            }
            if(newUser && newUser.id) {
                emit('confirm:register', true);
            }
        }
        else {
            notices.show({ severity: 'error', detail: 'Passwords do not match' });
        }
    } catch (error) {
        notices.show({ severity: 'error', detail: 'Error' });
    }
    finally {
        isLoading.value = false;
    }

}
</script>
