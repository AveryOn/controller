import { 
    CreateUserParamsApi, 
    UpdUserPasswordApi, 
    UserCreateResponseApi 
} from "../@types/entities/user.types";


const TIMEOUT = 1000;
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