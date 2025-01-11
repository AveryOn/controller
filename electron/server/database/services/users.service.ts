import { User } from "../../types/controllers/users.types";
import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { UserCreateDto, UserFindByUsernameDto, UserUpdatePasswordDto } from "../../types/services/users.service.types";
import { DatabaseManager } from "../manager";

export default class UserService {
    private instanceDb: InstanceDatabaseDoc | null = null;

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
    async create({ username, password, avatar, createdAt, updatedAt }: UserCreateDto) {
        await this.instanceDb!.run(`
            INSERT INTO users (username, password, avatar, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?);
        `, [username, password, avatar, createdAt, updatedAt]);
    }

    // Найти пользователя по username
    async findByUsername(dto: UserFindByUsernameDto): Promise<User | null> {
        const res = await this.instanceDb!.get(`
            SELECT 
                id, 
                username, 
                password, 
                avatar, 
                created_at AS createdAt, 
                updated_at AS updatedAt  
            FROM users
            WHERE username = ?;

        `,[dto.username]);
        if(!res || !res?.payload) throw '[UserService.findByUsername] > user not found';
        return res.payload;
    }

    // Обновление пароля
    async updatePassword(dto: UserUpdatePasswordDto): Promise<null> {
        await this.instanceDb!.run(`
            UPDATE users SET password = ? 
            WHERE username = ?;

        `,[dto.password, dto.username]);
        return null;
    }
} 