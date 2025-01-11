import { InstanceDatabaseDoc } from "../../types/database/index.types";
import { UserCreateDto, UserFindDto } from "../../types/services/users.service.types";
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
    async findByUsername(dto: UserFindDto) {
        const res = await this.instanceDb!.get(`
            SELECT * FROM users
            WHERE username = ?;

        `,[dto.username!]);
        if(!res || !res?.payload) throw '[UserService.findByUsername] > user not found';
        return res.payload;
    }
} 