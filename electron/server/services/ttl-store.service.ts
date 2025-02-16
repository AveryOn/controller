
export class TTLStore<T> {
    private static instance: TTLStore<any>;
    private store: Map<string, { value: T; expiresAt: number }>;

    private constructor() {
        this.store = new Map();
    }

    static getInstance<T>(): TTLStore<T> {
        if (!TTLStore.instance) {
            TTLStore.instance = new TTLStore<T>();
        }
        return TTLStore.instance;
    }

    /**
     * Создает новую запись в временном хранилище
     * @param key название ключа по которому происходит взаимодействие с записью
     * @param value значение которое будет хранится
     * @param ttl время которое запись будет существовать в хранилище (в `мс`)
     * @param cb коллбэк который вызывается, когда запись просрочилась и удаляется из хранилища 
     */
    set(key: string, value: T, ttl: number = (60 * 60 * 1), cb?: () => void) {
        const expiresAt = Date.now() + ttl;
        this.store.set(key, { value, expiresAt });
        setTimeout(() => {
            this.delete(key);
            cb?.call(null);
        }, ttl);
    }

    /**
     * Позволяет получить значение хранимое по ключу
     * @param key название ключа для извлечения значения
     * @returns значение из существующей записи
     */
    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry || entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    /**
     * Удаление строки по ключу
     * @param key название ключа
     */
    delete(key: string) {
        this.store.delete(key);
    }
}
