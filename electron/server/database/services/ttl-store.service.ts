
class TTLStore<T> {
    private static instance: TTLStore<any>;
    private store: Map<string, { value: T; expiresAt: number }>;

    private constructor() {
        this.store = new Map();
    }

    static getInstance<T>(): TTLStore<T> {
        if (!TTLStore.instance) {
            console.log('TTLStore инициализация...');
            TTLStore.instance = new TTLStore<T>();
        }
        return TTLStore.instance;
    }

    set(key: string, value: T, ttl: number = (60 * 60 * 1)) {
        const expiresAt = Date.now() + ttl;
        this.store.set(key, { value, expiresAt });
        setTimeout(() => {
            this.delete(key), ttl
            console.log(`TTLStore ключ ${key} был удален!!!`);
        });
    }

    get(key: string): T | undefined {
        const entry = this.store.get(key);
        if (!entry || entry.expiresAt < Date.now()) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    delete(key: string) {
        this.store.delete(key);
    }
}
