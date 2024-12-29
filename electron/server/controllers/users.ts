import { CreateUserParams, GetUsersConfig, LoginParams, LoginResponse, UpdatePasswordParams, User } from '../types/controllers/users.types';
import { encrypt, verify } from '../services/crypto.service';
import { createAccessToken } from '../services/tokens.service';
import { FsOperationConfig, readFile, writeFile } from '../services/fs.service';

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
        .catch(async () => {
            try {
                await writeFile(JSON.stringify([]), FSCONFIG);
                return true;
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

// Создание нового пользователя
export async function createUser(params: CreateUserParams) {
    console.log('[createUser] =>', params);
    try {
        if (!params.password || !params.username) throw '[createUser]>> INVALID_USER_DATA';
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
        // Запись нового пользователя в БД
        await writeFile(users, FSCONFIG);
        Reflect.deleteProperty(newUser, 'password');
        return newUser;
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
        // Извлечение пользователей
        const users: User[] = await readFile(FSCONFIG);
        
        // Поиск пользователя по username
        const findedUser: User | undefined = users.find((user: User) => user.username === params.username);
        if (!findedUser) {
            throw '[loginUser]>> NOT_EXISTS_RECORD';
        }
        console.log(findedUser);
        
        // Проверка пароля
        const isVerifyPassword = await verify(params.password, findedUser.password).catch((err) => {
            console.log('[loginUser]>> INTERNAL_ERROR', err);
        });
        // Если пароль верный то выписываем токен
        if (isVerifyPassword === true) {
            const readyUser = { ...findedUser };
            Reflect.deleteProperty(readyUser, 'hash_salt');
            Reflect.deleteProperty(readyUser, 'password');
            // Формируем токен доступа
            const token = await createAccessToken({ 
                id: readyUser.id, 
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
        // Извлечение пользователей
        let users: User[] = await getUsers();
        // Поиск пользователя по username
        const findedUser: User | undefined = users.find((user: User) => user.username === params.username);
        if (!findedUser) {
            throw '[updatePassword]>> NOT_EXISTS_RECORD';
        }
        // Проверка паролей
        if(!await verify(params.oldPassword, findedUser.password)) {
            throw '[updatePassword]>> INVALID_CREDENTIALS';
        }
        // Хеширование нового пароля
        const hash = await encrypt(params.newPassword);
        findedUser.password = hash;
        // Обновление записи пользователя в БД
        users = users.map((user: User) => {
            if(user.id === findedUser.id) {
                return findedUser;
            } 
            return user;
        });
        await writeUsersDataFs(users);
        return true;
    } catch (err) {
        console.error(err);
        throw err;
    }
}