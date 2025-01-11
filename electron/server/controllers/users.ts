import { CreateUserParams, GetUsersConfig, PrepareUserStoreParams, UpdatePasswordParams, User, UserCreateResponse } from '../types/controllers/users.types';
import { encrypt, verify } from '../services/crypto.service';
import { FsOperationConfig, isExistFileOrDir, mkDir, readFile, writeFile } from '../services/fs.service';
import UserService from '../database/services/users.service';
import { prepareUserStore } from './system.controller';
import { formatDate } from '../services/date.service';

const FILENAME = 'users.json';
const FSCONFIG: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: FILENAME,
    format: 'json',
}

// Подготовить пользовательское хранилище
export async function prepareUserStore(params: PrepareUserStoreParams): Promise<Array<User>> {
    try {

    } catch (err) {
        console.error(err);
        throw err;
    }
}

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
    console.log('[initUserDir] =>', user);
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
            console.log(`Директория ${userDirName} пользователя ${user.id} НЕ существует`);
            // Сначала создать директорию
            await mkDir(userDirName);
            if(await isExistFileOrDir(userDirName)) {
                console.log('СОЗДАНИЕ ДИРЕКТОРИИ ПРОШЛО УСПЕШНО');
                // Инициализация баз данных
                await prepareUserStore(null, user.username);
                return true;
            }
            else {
                console.log(`ДИРЕКТОРИИ ${userDirName} не существует`);
                return false;
            }
        }
        // Если пользовательская директория существует
        else {
            console.log(`Директория ${userDirName} пользователя ${user.id} существует`);
            return false;
        }
    } catch (err) {
        throw err;
    }
}

// Создание нового пользователя при регистрации
export async function createUser(params: CreateUserParams): Promise<UserCreateResponse> {
    console.log('[createUser] =>', params);
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
            throw new Error(`[createUser]>> директория для пользователя ${newUser.id} создана не была!`);
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