import buttonComp from "./buttonComp.vue";
import SelectButton from 'primevue/selectbutton';
import Password from 'primevue/password';
import Button from "primevue/button";
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';


buttonComp.name = 'cButton';

export default [
    buttonComp,
    SelectButton,
    Password,
    Button,
    InputText,
    Toast,
] as any[];