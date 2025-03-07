import { defineStore } from "pinia";
import { type Ref, ref } from "vue";
import { User } from "../@types/entities/user.types";
// import { useRouter } from "vue-router";
import { LocalVars } from "../@types/main.types";

export const useLoginStore = defineStore('loginStore', () => {
    // const router = useRouter();
    const isAuth = ref(false);
    const token: Ref<string | null> = ref(null);
    const widget = 'register';
    const widgets = ['register', 'login'];

    // Установить учетные данные для доступа в локальном хранилище
    function setCredentials(accessToken: string, userData: User) {
        token.value = accessToken;
        isAuth.value = true;
        localStorage.setItem(LocalVars.token, accessToken);
        localStorage.setItem(LocalVars.userData, JSON.stringify(userData));
    }

    return {
        isAuth,
        token,
        widget,
        widgets,
        setCredentials,
    }
});