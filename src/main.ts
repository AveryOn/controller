import { createApp } from 'vue';
import init from './init.vue';
import { router } from './router';
import './styles/index.css';
import '/node_modules/primeflex/primeflex.css';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import baseComponents from './components/base';
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css'


const app = createApp(init);

baseComponents.forEach((component) => {
    app.component(component.name, component);
});

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(createPinia());
app.use(ToastService);
app.mount('#app');