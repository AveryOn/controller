<template>
    <form @submit.prevent class="update-form">
        <h2 class="mb-2">Update Password</h2>
        <Fluid class="w-10">
            <div class="flex flex-column gap-1">
                <InputText size="small" type="text" v-model="form.username" placeholder="Username" />
                <Password size="small" v-model="form.oldPassword" placeholder="Old Password" :feedback="false"
                    toggleMask />
                <Password size="small" v-model="form.newPassword" placeholder="New Password" :feedback="false"
                    toggleMask />
                <Password size="small" v-model="form.confirmPassword" placeholder="Confirm Password" :feedback="false"
                    toggleMask />
            </div>
            <Button class="mt-3 mb-2" fluid label="Confirm" size="small" :loading="isLoading" @click="submit" />
        </Fluid>

    </form>
</template>

<script setup lang="ts">
import Fluid from 'primevue/fluid';
import { ref, defineEmits } from 'vue';
import useNotices from '../../composables/notices';
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


async function submit() {
    try {
        const isSuccess: boolean = await window.electron.updatePassword({
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
    } catch (err) {
        emit('confirm:update', false);
        notices.show({ detail: 'Error', severity: 'error' });
        throw err;
    } finally {
        isLoading.value = false;
    }

}

</script>

<style scoped>
.update-form {
    width: 400px;
    height: max-content;
    background-color: rgb(222, 222, 222);
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}
</style>