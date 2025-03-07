import { 
    CreateUserParamsApi, 
    UpdUserPasswordApi, 
    UserCreateResponseApi 
} from "../@types/entities/user.types";
import { LocalVars } from "../@types/main.types";


// Подготовить пользовательское хранилище
export async function prepareUserStore() {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.prepareUserStore({ token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Регистрация нового пользователя в системе
export async function createUserApi(params: CreateUserParamsApi): Promise<UserCreateResponseApi> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.createUser(params));
        } catch (err) {
            reject(err);
        }
    });
}

// Обновление пароля пользователя
export async function updateUserPasswordApi(params: UpdUserPasswordApi): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.updatePassword(params));
        } catch (err) {
            reject(err);
        }
    });
}