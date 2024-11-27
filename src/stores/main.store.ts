import { defineStore } from "pinia";
import { type Ref, ref } from "vue";

export const useMainStore = defineStore('mainStore', () => {
    const appTitle: Ref<string> = ref('controller'); 

    return {
        appTitle,
    }
});