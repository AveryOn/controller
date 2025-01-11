import { 
    CreateUserParamsApi, 
    PrepareUserStorageParamsApi, 
    UserCreateResponseApi 
} from "../@types/entities/user.types";


const TIMEOUT = 1000;
// Вызов подготовки пользовательского хранилища
export async function prepareUserStorageApi(params: PrepareUserStorageParamsApi): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(() => {
            try {
                resolve(window.electron.prepareUserStorage(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
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