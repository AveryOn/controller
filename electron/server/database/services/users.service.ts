import { User, UserCreateResponse } from '../../types/controllers/users.types';
import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { UserCreateDto, UserFindByUsernameDto, UserUpdatePasswordDto } from "../../types/services/users.service.types";
import { DatabaseManager } from "../manager";

export default class UserService {
    private instanceDb: InstanceDatabaseDoc | null = null;
    private allFields = {
        id:         'id',
        username:   'username',
        password:   'password',
        avatar:     'avatar',
        createdAt:  'created_at AS createdAt',
        updatedAt:  'updated_at AS updatedAt',
    }

    constructor() {
        this.instanceDb = DatabaseManager
            .instance()
            .getDatabase('users');
        if(!this.instanceDb) throw new Error('DB users is not initialized');
    }

    // Получить массив пользователей
    async getAll() {
        const rows = await this.instanceDb!.all(`
            SELECT * FROM users;
        `);
        return rows;
    }

    // Создать одного пользователя
    async create({ username, password, avatar, createdAt, updatedAt }: UserCreateDto): Promise<UserCreateResponse> {
        await this.instanceDb!.run(`
            INSERT INTO users (username, password, avatar, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?);
        `, [username, password, avatar, createdAt, updatedAt]);
        const newUser = await this.findByUsername({ username: username }, { excludes: ['password'] });
        if(!newUser) throw new Error('[UserService.create]>> newUser was not created');
        return newUser;
    }

    // Найти пользователя по username
    async findByUsername(dto: UserFindByUsernameDto, config?: { excludes?: Array<keyof User> }): Promise<User | null> {
        try {
            let correctFieldsSql;
            if(config?.excludes?.length! > 0) {
                correctFieldsSql = Object.entries(this.allFields).filter(([key, value]) => {
                    if(!config?.excludes!.includes(key as keyof User)) return true;
                    else return false;
                }).map(([_, value]) => value).join(',');
            }
            else correctFieldsSql = Object.values(this.allFields).join(',');
            const res = await this.instanceDb!.get(`
                SELECT ${correctFieldsSql}
                FROM users
                WHERE username = ?;
    
            `,[dto.username]);
            if(!res || !res?.payload) return null;
            return res.payload;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Обновление пароля
    async updatePassword(dto: UserUpdatePasswordDto): Promise<any> {
        await this.instanceDb!.run(`
            UPDATE users SET password = ? 
            WHERE username = ?;

        `,[dto.password, dto.username]);
        return null;
    }
} 