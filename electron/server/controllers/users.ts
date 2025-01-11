import { CreateUserParams, GetUsersConfig, LoginParams, LoginResponse, UpdatePasswordParams, User, UserCreateResponse } from '../types/controllers/users.types';
import { encrypt, verify } from '../services/crypto.service';
import { createAccessToken } from '../services/tokens.service';
import { FsOperationConfig, isExistFileOrDir, mkDir, readFile, writeFile } from '../services/fs.service';
import UserService from '../database/services/users.service';

const FILENAME = 'users.json';
const FSCONFIG: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: FILENAME,
    format: 'json',
}

// Сбросить все данные users 
export async function resetUsersDB() {
    console.log('[resetUsersDB] => void');
    try {
        await writeFile([], FSCONFIG);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Запись данных в БД users 
async function writeUsersDataFs(data: User[]): Promise<void> {
    try {
        return void await writeFile(JSON.stringify(data), FSCONFIG);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Подгтововить базу данных пользователей
export async function prepareUsersStore(): Promise<boolean> {
    return readFile(FSCONFIG)
        .then((data) => {
            return true;
        })
        .catch(async (err) => {
            try {
                if(err.code === 'ENOENT') {
                    await writeFile([], FSCONFIG);
                    return true;
                }
                return false;
            } catch (err) {
                console.error('WRITE FILE', err);
                return false;
            }
        })
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
async function initUserDir(user: User): Promise<boolean> {
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
                // Затем создать файл user-[id].json (Он нужен т.к у каждого из пользователей должна быть информация о себе)
                await writeFile({}, { ...FSCONFIG, filename: `${userDirName}/${userDirName}.json` });
                // Инициализация баз данных
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
        // Получение списка пользователей
        const users: Array<User> = await readFile(FSCONFIG);
        // Проверка на то что пользователя с таким username в БД нет
        users.forEach((user) => {
            if (user.username === params.username) {
                throw '[createUser]>> CONSTRAINT_VIOLATE_UNIQUE';
            }
        });
        const now = (new Date()).toISOString();
        // Если проверка прошла успешно, то создаем нового пользователя
        const hash = await encrypt(params.password);
        const newUser: User = {
            id: Date.now(),
            username: params.username,
            password: hash,
            avatar: null,
            createdAt: now,
            updatedAt: now,
        }
        users.push(newUser);
        await userService.create({
            username: newUser.username,
            password: newUser.password,
            avatar: newUser.avatar,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        });
        // Запись нового пользователя в БД
        await writeFile(users, FSCONFIG);
        Reflect.deleteProperty(newUser, 'password');
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

// Подтверждение учетных данных пользователя при входе в систему
export async function loginUser(params: LoginParams): Promise<LoginResponse> {
    console.log('[loginUser] =>', params);

    try {
        if (!params.password || !params.username) throw '[loginUser]>> INVALID_USER_DATA';
        // Получение экземпляра сервиса
        const userService = new UserService();
        // Извлечение пользователей
        // const users: User[] = await readFile(FSCONFIG);
        
        // Поиск пользователя по username
        const user = await userService.findByUsername({ username: params.username })
        // const user: User | undefined = users.find((user: User) => user.username === params.username);
        if (!user) {
            throw '[loginUser]>> NOT_EXISTS_RECORD';
        }
        console.log(user);
        
        // Проверка пароля
        const isVerifyPassword = await verify(params.password, user.password).catch((err) => {
            console.log('[loginUser]>> INTERNAL_ERROR', err);
        });
        // Если пароль верный то выписываем токен
        if (isVerifyPassword === true) {
            const readyUser = { ...user };
            Reflect.deleteProperty(readyUser, 'hash_salt');
            Reflect.deleteProperty(readyUser, 'password');
            // Формируем токен доступа
            const token = await createAccessToken({ 
                userId: readyUser.id, 
                username: readyUser.username 
            }, { m: 1, s: 20 });
            return {
                token: token,
                user: readyUser,
            } as LoginResponse;
        }
        // Иначе выкидываем ошибку
        else {
            throw '[loginUser]>> INVALID_CREDENTIALS';
        }
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
        // Извлечение пользователей
        // let users: User[] = await getUsers();
        // Получение экземпляра сервиса
        const userService = new UserService();
        const user = await userService.findByUsername({ username: params.username });
        // Поиск пользователя по username
        // const user: User | undefined = users.find((user: User) => user.username === params.username);
        if (!user) {
            throw '[updatePassword]>> NOT_EXISTS_RECORD';
        }
        // Проверка паролей
        if(!await verify(params.oldPassword, user.password)) {
            throw '[updatePassword]>> INVALID_CREDENTIALS';
        }
        // Хеширование нового пароля
        const hash = await encrypt(params.newPassword);
        // user.password = hash;
        // Обновление записи пользователя в БД
        await userService.updatePassword({ 
            username: params.username, 
            password: hash 
        });
        // users = users.map((user: User) => {
        //     if(user.id === user.id) {
        //         return user;
        //     } 
        //     return user;
        // });
        // await writeUsersDataFs(users);
        return true;
    } catch (err) {
        console.error(err);
        throw err;
    }
}