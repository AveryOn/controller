<template>
    <div class="login-view flex flex-column align-items-center justify-content-center gap-2">
        <SelectButton 
        @update:model-value="updateSelect" 
        :model-value="selectMode" 
        :default-value="'Login'" 
        :options="['Update', 'Login', 'Sign Up']" 
        size="small" 
        />
        <div class="forms-wrapper">
            <UpdateForm 
            class="form" 
            v-show="selectMode === 'Update'" 
            @confirm:update="handlerUpdate"
            />
            <RegisterForm 
            class="form" 
            v-show="selectMode === 'Sign Up'" 
            @confirm:register="handlerSignUp"
            />
            <LoginForm 
            class="form" 
            v-show="selectMode === 'Login'" 
            @confirm:login="handlerLogin"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import RegisterForm from '../components/login.view/registerForm.vue';
import LoginForm from '../components/login.view/loginForm.vue';
import UpdateForm from '../components/login.view/updateForm.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const selectMode = ref('Login');
const router = useRouter();

function updateSelect(value: string | undefined): void {
    if(!value) return void (selectMode.value = 'Login');
    selectMode.value = value;
}

function handlerSignUp(state: boolean): void {
    if(state === true) {
        selectMode.value = 'Login';
    }
}

function handlerLogin(state: boolean, token: string | null): void {
    if(state === true) {
        router.push({ name: 'main' });
    }
}

function handlerUpdate(state: boolean) {
    if(state === true) {
        selectMode.value = 'Login';
    }
}
</script>

<style scoped>
.login-view {
    width: 100vw;
    height: 100vh;
    font-family: var(--font);
    background-color: var(--bg-color);
}
.form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.3rem;
    color: var(--fg-color);
    user-select: none;
}
</style>