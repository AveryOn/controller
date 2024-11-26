import { useToast } from 'primevue/usetoast';


interface DefaultConfig {
    severity?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' | undefined;
    summary?: string | undefined;
    detail?: any | undefined;
    closable?: boolean | undefined;
    life?: number | undefined;
    group?: string | undefined;
    styleClass?: any;
    contentStyleClass?: any;
}

export default function useNotices() {
    const toast = useToast();


    const defaultConfig: DefaultConfig ={
        severity: 'info',
        summary: 'Info',
        detail: 'Message Content',
        group: 'br',
        life: 3000,
    }
    function show(config=defaultConfig) {
        const correctConfig: DefaultConfig = { ...defaultConfig, ...config };
        toast.add(correctConfig);
    };

    return {
        show,
    }
}