import { 
    CreateUserParamsApi, 
    UpdUserPasswordApi, 
    UserCreateResponseApi 
} from "../@types/entities/user.types";


const TIMEOUT = 1000;
// Подготовить пользовательское хранилище
export async function prepareUserStore() {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.prepareUserStore({ token: localStorage.getItem('token') }));
        } catch (err) {
            reject(err);
        }
    });
}

// Регистрация нового пользователя в системе
export async function createUserApi(params: CreateUserParamsApi): Promise<UserCreateResponseApi> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(() => {
            try {
                resolve(window.electron.createUser(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Обновление пароля пользователя
export async function updateUserPasswordApi(params: UpdUserPasswordApi): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(() => {
            try {
                resolve(window.electron.updatePassword(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}