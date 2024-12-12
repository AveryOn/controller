import { defineStore } from "pinia";
import { type Ref, ref } from "vue";
import { User } from "../@types/entities/user.types";

export const useLoginStore = defineStore('loginStore', () => {
    const isAuth = ref(true);
    const token: Ref<string | null> = ref(null);
    const widget = 'register';
    const widgets = ['register', 'login'];

    // Установить учетные данные для доступа в локальном хранилище
    function setCredentials(accessToken: string, userData: User) {
        token.value = accessToken;
        isAuth.value = true;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user-data', JSON.stringify(userData));
    }

    return {
        isAuth,
        token,
        widget,
        widgets,
        setCredentials,
    }
});