import buttonComp from "./buttonComp.vue";
import SelectButton from 'primevue/selectbutton';
import Password from 'primevue/password';
import Button from "primevue/button";
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import PanelMenu from 'primevue/panelmenu';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import ProgressSpinner from 'primevue/progressspinner';
import Menubar from 'primevue/menubar';
import Dialog from 'primevue/dialog';
import ProgressBar from 'primevue/progressbar';
import IftaLabel from 'primevue/iftalabel';


buttonComp.name = 'cButton';

export default [
    buttonComp,
    SelectButton,
    Password,
    Button,
    InputText,
    Toast,
    PanelMenu,
    Select,
    FileUpload,
    ProgressSpinner,
    Menubar,
    Dialog,
    ProgressBar,
    IftaLabel,
] as any[];