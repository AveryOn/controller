import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoginStore = defineStore('loginStore', () => {
    const isAuth = ref(true);
    const widget = 'register';
    const widgets = ['register', 'login'];

    return {
        isAuth,
        widget,
        widgets,
    }
});