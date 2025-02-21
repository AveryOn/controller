

/**
 * Проверить что у пользователя есть доступ для работы с приложением
 * @returns {Promise<boolean>} `true` если есть доступ иначе - `false`
 */
export async function checkAccessApi(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.checkAccess())
        } catch (err) {
            reject(err);
        }
    });
}