<template>
    <form 
    class="add-chapter-form" 
    @submit.prevent
    >
        <selectIconDialog 
        v-model="isActiveSelectIconDialog"
        @select="(iconPath) => selectIcon(iconPath)"
        :is-modal="true"
        />
        <h2 class="mb-2">{{ props.title }}</h2>
        <div class="w-9 mt-3 flex flex-column gap-2">
            <!-- Label -->
            <InputText 
            v-if="computeVisible['label']"
            class="w-full" 
            type="text"
            v-model="form.label" 
            placeholder="Label" 
            size="small"
            />
            <span v-if="computeVisible['pathName']" class="flex gap-1 font-bold mt-2">Example: 
                <span class="example-item">foobar</span> 
                <span class="example-item">foo-bar</span> 
                <span class="example-item">foo_bar</span> 
            </span>
            <!-- Query Name -->
            <InputText 
            v-if="computeVisible['pathName']"
            class="w-full" 
            type="text" 
            v-model="form.pathName" 
            placeholder="Path name" 
            size="small"
            />
            <!-- ICON SELECT -->
            <span class="mt-2 font-bold">Select Icon</span>
            <div class="form-action-select-icon flex align-items-center gap-3 w-full">
                <Button 
                severity="secondary" 
                outlined 
                label="Select" 
                size="small" 
                @click="isActiveSelectIconDialog = true"
                />
                <span>Selected:</span>
                <span class="selected-icon-bg" :class="form.symbol? 'selected' : 'notselected'">
                    <svg-icon type="mdi" :path="form.symbol"></svg-icon>
                </span>
            </div>
            <!-- ICON TYPE -->
            <!-- <span v-if="false && computeVisible['iconType']" class="mt-2 font-bold">Icon Type</span>
            <Select 
            v-if="false && computeVisible['iconType']"
            size="small"
            v-model="form.iconType" 
            :options="iconsTypes" 
            @change="(e) => chooseIconType(e.value)"
            optionLabel="name" 
            option-value="value" 
            placeholder="Icon Type" 
            class="w-full" 
            /> -->
            <!-- Symbol / Icon -->
            <div v-if="false" class="w-full flex gap-2 align-items-start">
                <!-- ICON MODE -->
                <Select 
                v-model="modeIcon" 
                :options="modesIcon" 
                size="small"
                optionLabel="name" 
                option-value="value" 
                placeholder="Mode" 
                class="w-4" 
                />
                <!-- SVG PATH -->
                <InputText
                v-if="!modeIcon ? true : modeIcon === 'svg'"
                class="w-8" 
                type="text" 
                v-model="form.symbol" 
                placeholder="Svg path" 
                size="small"
                />
                <!-- Symbol -->
                <InputText
                v-if="modeIcon === 'sym'"
                class="w-8" 
                type="text" 
                v-model="form.symbol" 
                placeholder="Symbol: any" 
                size="small"
                />
                <!-- File Icon -->
                <div 
                v-if="modeIcon === 'img'"
                class="w-8 flex align-items-start gap-2"
                >
                    <FileUpload 
                    mode="basic" 
                    @select="onFileSelect" 
                    customUpload 
                    auto 
                    severity="secondary" 
                    class="p-button-outlined" 
                    >
                        <template #header="{ clearCallback }">
                            <Button @click="clearCallback" label="HELLLO" rounded outlined severity="danger"></Button>
                        </template>
                    </FileUpload>
                </div>
            </div>
            <img 
            v-if="src && modeIcon === 'img'" 
            :src="src" 
            alt="Image" 
            class="img w-8 mx-auto" 
            />
            <!-- CHAPTER TYPE -->
            <span v-if="computeVisible['type']" class="mt-2 font-bold">Chapter Type</span>
            <Select 
            v-if="computeVisible['type']"
            class="w-full -mt-1" 
            v-model="form.type"
            @change="(e) => form.type = e.value"
            size="small"
            :options="chapterTypes" 
            optionLabel="name" 
            option-value="value" 
            placeholder="Chapter Type" 
            />
            <div class="form-actions flex gap-3 ml-auto">
                <!-- Кнопка Сбросить -->
                <Button 
                v-if="props.resetBtn"
                class="mt-2 text-xs font-bold w-max ml-auto" 
                size="small" 
                severity="warn"
                icon="pi pi-"
                title="Reset Form"
                @click="resetForm"
                >
                    <svg-icon type="mdi" :path="mdiBackupRestore" :size="16"></svg-icon>
                </Button>
                <!-- Кнопка Submit -->
                <Button 
                class="mt-2 text-xs font-bold w-max" 
                size="small" 
                severity="info"
                :loading="loading"
                label="Submit"
                :disabled="props.disableSubmit"
                @click="send"
                />
           
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, type Ref, ref, watch } from 'vue';
import type { ChapterCreate, ChapterTypes, CreateChapterForm, IconTypes, ModesIcon,  } from '../../@types/entities/materials.types';
import useNotices from '../../composables/notices';
import selectIconDialog from '../base/dialogs/selectIconDialog.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiBackupRestore } from '@mdi/js';

interface Props {
    formType?: 'return' | 'inner';
    title?: string;
    initFormData?: CreateChapterForm | null;
    resetBtn?: boolean;
    excludeFields?: Array<keyof CreateChapterForm>;
    disableSubmit?: boolean;
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    formType: 'inner',
    title: 'Add New Chapter',
    resetBtn: false,
    disableSubmit: false,
});

const emit = defineEmits<{
    (e: 'submitForm', newChapter: ChapterCreate): void;
}>();

const notices = useNotices();

const isActiveSelectIconDialog = ref(false);
const isLoadingForm = ref(false);
const src = ref<any>(null);
const modeIcon = ref('svg');
const modesIcon: Ref<ModesIcon[]> = ref([
    { name: 'Image', value: 'img' },
    { name: 'Symbol', value: 'sym' },
    { name: 'Svg path', value: 'svg' },
]);
const chapterTypes: Ref<ChapterTypes[]> = ref([
    { name: 'Directory', value: 'dir' },
    { name: 'File', value: 'file' },
]);
const iconsTypes: Ref<IconTypes[]> = ref([
    { name: 'PI', value: 'pi' },
    { name: 'MDI', value: 'mdi' },
    { name: 'IMG', value: 'img' },
]);
const mapIconTypesModes = {
    'pi': 'sym',
    'mdi': 'svg',
    'img': 'img',
}

const form: Ref<CreateChapterForm> = ref<CreateChapterForm>({
    label: '',
    pathName: '',
    symbol: '',
    iconType: 'pi',
    iconImg: null,
    type: 'file',
});

// Свойство вычисляет хеш-таблицу, по которой меняется видимость полей формы 
const computeVisible = computed(() => {
    const visibleMap = { label: true, pathName: true, symbol: true, iconType: true, iconImg: true, type: true };
    if(props.excludeFields) {
        props.excludeFields.forEach((key) => {
            visibleMap[key] = false;
        })
    } 
    return visibleMap;
});

// Определить актульное состояние для прогресс значка
const loading = computed(() => {
    if(typeof props.loading !== 'undefined') return props.loading;
    else return isLoadingForm.value;
});

function selectIcon(path: string) {
    form.value.symbol = path;
    isActiveSelectIconDialog.value = false;
}

// Установка префикса pi
function correctSymbol() {
    if(form.value.iconType === 'pi') {
        return `pi ${form.value.symbol}`;
    } 
    else {
        return form.value.symbol;
    }
}
// Очистка формы
function cleanForm() {
    form.value = {
        label: '',
        pathName: '',
        symbol: '',
        iconType: 'mdi',
        iconImg: null,
        type: 'file',
    }
}
// Сброс формы
function resetForm() {
    if(props.initFormData) {
        filledInitForm(props.initFormData);
    } 
    else cleanForm();
}
function validateForm(config?: { exclude?: (keyof CreateChapterForm)[] }) {
    let isValid = true;
    const setValidFalse = (key: keyof CreateChapterForm) => {
        // Если ключ исключен в конфиге для проверки на валидацию, игнорируем его 
        if(config && config.exclude?.includes(key)) {
            return true;
        }
        return false;
    }
    if(!form.value.type) return setValidFalse('type');
    if(!form.value.symbol) return setValidFalse('symbol');
    if(!form.value.pathName) return setValidFalse('pathName');
    if(!form.value.label) return setValidFalse('label');
    if(!form.value.iconType) return setValidFalse('iconType');
    if(form.value.iconType === 'img' && !form.value.iconImg) return false;
    return isValid;
}

// Отправка данных с формы
async function send() {
    try {
        if(!validateForm({ exclude: props.excludeFields })) return notices.show({ detail: 'Filled form', severity: 'error' });
        isLoadingForm.value = true;
        const newChapter: ChapterCreate = {
            label: form.value.label,
            pathName: form.value.pathName,
            icon: correctSymbol(),
            iconType: form.value.iconType!,
            chapterType: form.value.type!,
            route: 'materials',
        }
        emit('submitForm', newChapter);
    } catch (err) {
        notices.show({ detail: '', severity: 'error' });
        throw err;    
    } finally { 
        isLoadingForm.value = false;
    }
}

function chooseIconType(value: keyof typeof mapIconTypesModes) {
    modeIcon.value = mapIconTypesModes[value];
    form.value.iconType = value;
}

function onFileSelect(event: any) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        src.value = e.target!.result;
    };
    reader.readAsDataURL(file);
}
// Заполнить форму в случае если она инициализирутся с данными по умолчанию (props.initFormData)
const filledInitForm = (newData: CreateChapterForm | null | undefined) => {
    if (newData) {
        form.value = { ...newData };
        // Корректировка имени иконки для типа pi
        if(form.value.iconType === 'pi') {
            form.value.iconType = 'mdi';
            // const symbolChunks = form.value.symbol.trim().split(' ')
            // if(symbolChunks.length > 1) form.value.symbol = symbolChunks.slice(1).join('');
        }
        // Корректировка типа иконки
        modeIcon.value = mapIconTypesModes[newData.iconType] as keyof typeof mapIconTypesModes;
    }
    else cleanForm();
}

function controllKey(e: KeyboardEvent) {
    if(e.key === 'Escape') {
        if(isActiveSelectIconDialog.value) isActiveSelectIconDialog.value = false;
    }
}

onMounted(() => {
    // Установка по данных формы по умолчанию, если они пришли в пропсах
    watch(() => props.initFormData, (newData) => filledInitForm(newData))
    filledInitForm(props.initFormData);
    window.addEventListener('keydown', controllKey);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', controllKey);
})

</script>

<style scoped>
.add-chapter-form {
    width: 500px;
    min-height: 200px;
    height: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgb(225, 225, 225);
    font-family: var(--font);
    border-radius: var(--rounded);
    padding: 1rem;
    padding-bottom: 2rem;
}
.example-item {
    background-color: rgba(128, 128, 128, 0.435);
    padding: 0 0.3rem;
    border-radius: var(--rounded);
}
.img {
    object-fit: cover;
    border-radius: var(--rounded);
}
.selected-icon-bg {

    padding: 0.3rem;
    border-radius: 5px;
}
.selected-icon-bg.selected {
    border: 2px solid rgb(78, 229, 131);
    background-color: rgba(78, 229, 131, 0.235);
}
.selected-icon-bg.notselected {
    border: 2px solid rgb(221, 180, 104);
    background-color: rgba(221, 180, 104, 0.235);
}
</style>