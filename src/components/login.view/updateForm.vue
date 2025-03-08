<template>
    <form @submit.prevent class="form pt-3 pb-5">
        <h2 class="mb-4">Update Password</h2>
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
                    v-model="form.oldPassword" 
                    placeholder="Old Password" 
                    :feedback="false"
                    toggleMask 
                />
                <Password 
                    size="small" 
                    v-model="form.newPassword" 
                    placeholder="New Password" 
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
            <Button 
                class="mt-5" 
                fluid 
                label="Confirm" 
                size="small" 
                :loading="isLoading" 
                :disabled="!isFilledForm"
                @click="submit" 
            />
        </Fluid>

    </form>
</template>

<script setup lang="ts">
import Fluid from 'primevue/fluid';
import { ref, defineEmits, computed } from 'vue';
import useNotices from '../../composables/notices';
import { updateUserPasswordApi } from '../../api/users.api';

const notices = useNotices();

const emit = defineEmits({
    'confirm:update': (data) => true,
})

const isLoading = ref(false);
const form = ref({
    username: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
});

/**
 * Определяет все ли поля формы заполнены
 */
 const isFilledForm = computed(() => {
    return (
        !!form.value.username &&
        !!form.value.oldPassword &&
        !!form.value.newPassword &&
        !!form.value.confirmPassword
    ) 
})

/** Проверяет, сопоставляются ли пароли */
const isPasswordsMatch = computed(() => {
    return (
        form.value.newPassword === form.value.confirmPassword
    )
})

async function submit() {
    try {
        isLoading.value = true;

        // Если пароли не сопоставляются
        if(!isPasswordsMatch.value) {
            return notices.show({ 
                detail: 'Passwords do not match', 
                severity: 'error' 
            });
        }

        // Если старый пароль равен новому паролю
        if(form.value.oldPassword === form.value.newPassword) {
            return notices.show({ 
                detail: 'The new password must not match the old password', 
                severity: 'error' 
            });
        }

        const isSuccess: boolean = await updateUserPasswordApi({
            username: form.value.username,
            oldPassword: form.value.oldPassword,
            newPassword: form.value.newPassword,
        })
        emit('confirm:update', isSuccess);
        form.value = {
            username: '',
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        };
        if(isSuccess) notices.show({ 
            detail: 'Success', 
            severity: 'success' 
        });
    } catch (err) {
        emit('confirm:update', false);
        notices.show({ detail: 'Error', severity: 'error' });
        throw err;
    } finally {
        isLoading.value = false;
    }

}

</script>
