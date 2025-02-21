import { CreateUserParams, GetUsersConfig, UpdatePasswordParams, User, UserCreateResponse } from '../types/controllers/users.types';
import { encrypt, encryptPragmaKey, verify } from '../services/crypto.service';
import { FsOperationConfig, isExistFileOrDir, mkDir, readFile } from '../services/fs.service';
import UserService from '../database/services/users.service';
import { prepareUserStore } from './system.controller';
import { formatDate } from '../services/date.service';
import { GlobalNames, Vars } from '../../config/global';
import { TTLStore } from '../services/ttl-store.service';
import { logoutIpc } from '../ipc/users.ipc';
import { BrowserWindow } from 'electron';


// инициализация TTL хранилища 
const storeTTL = TTLStore.getInstance<string>()
const FILENAME = 'users.json';
const FSCONFIG: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: FILENAME,
    format: 'json',
}

// // Подготовить пользовательское хранилище
// export async function prepareUserStore(params: PrepareUserStoreParams): Promise<Array<User>> {
//     try {

//     } catch (err) {
//         console.error(err);
//         throw err;
//     }
// }

// Получение пользователей с базы данных
export async function getUsers(config?: GetUsersConfig): Promise<Array<User>> {
    try {
        // Получение списка пользователей
        const users: Array<User> = await readFile(FSCONFIG);
        // Получение по пагинации
        if (config && config.page && config.perPage) {
            const right = config.perPage * config.page;
            const left = right - config.perPage;
            return users.slice(left, right);
        }
        else return users;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Зарегистрировать пользовательскую директорию (при регистрации нового пользователя)
async function initUserDir(user: UserCreateResponse): Promise<boolean> {
    if(!user) throw new Error('user - обязательный аргумент');
    try {
        // Если id пользователя невалидный
        if(typeof user.id !== 'number' || user.id !== user.id) {
            throw new TypeError('[initUserDir]>> ID пользователя неверный');
        }
        // Создается имя директории
        const userDirName = `user_${user.username}`;
        const isExistUserDir = await isExistFileOrDir(userDirName);
        // Если пользовательская директория НЕ существует
        if(isExistUserDir === false) {
            // Сначала создать директорию
            await mkDir(userDirName);
            if(await isExistFileOrDir(userDirName)) {
                // Инициализация баз данных
                await prepareUserStore(null, user.username);
                return true;
            }
            else {
                return false;
            }
        }
        // Если пользовательская директория существует
        else {
            return false;
        }
    } catch (err) {
        throw err;
    }
}

// Создание нового пользователя при регистрации
export async function createUser(win: BrowserWindow | null, params: CreateUserParams): Promise<UserCreateResponse> {
    try {
        if (!params.password || !params.username) throw '[createUser]>> INVALID_USER_DATA';
        // Получение экземпляра сервиса
        const userService = new UserService();
        const user = await userService.findByUsername({ username: params.username });
        if(user) {
            throw '[createUser]>> CONSTRAINT_VIOLATE_UNIQUE';
        }
        // Если проверка прошла успешно, то создаем нового пользователя
        const now = formatDate();
        const hash = await encrypt(params.password);
        
        // Формируется ключ шифрования баз данных уровня пользователь
        const keyDB = await encryptPragmaKey(params.username, params.password);
        storeTTL.set(GlobalNames.USER_PRAGMA_KEY, keyDB, Vars.USER_PRAGMA_KEY_TTL, () => logoutIpc(win))

        // Запись нового пользователя в БД
        const newUser = await userService.create({
            username: params.username,
            password: hash,
            avatar: null,
            createdAt: now,
            updatedAt: now,
        });
        const isCreationNewDir = await initUserDir(newUser);
        if(!isCreationNewDir) {
            throw new Error(`[createUser]>> directory for user ${newUser.id} was not created!`);
        }
        return newUser as UserCreateResponse;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Обновление пароля
export async function updatePassword(params: UpdatePasswordParams): Promise<boolean> {
    try {
        if(params.newPassword === params.oldPassword) throw '[updatePassword]>> INVALID_DATA';
        if(!params.username) throw '[updatePassword]>> INVALID_DATA';

        // Получение экземпляра сервиса
        const userService = new UserService();

        const user = await userService.findByUsername({ username: params.username });
        // Поиск пользователя по username
        if (!user) {
            throw '[updatePassword]>> NOT_EXISTS_RECORD';
        }
        // Проверка паролей
        if(!await verify(params.oldPassword, user.password)) {
            throw '[updatePassword]>> INVALID_CREDENTIALS';
        }
        // Хеширование нового пароля
        const hash = await encrypt(params.newPassword);
        // Обновление записи пользователя в БД
        await userService.updatePassword({ 
            username: params.username, 
            password: hash 
        });
        return true;
    } catch (err) {
        console.error(err);
        throw err;
    }
}