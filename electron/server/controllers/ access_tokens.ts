import { FsOperationConfig, readFile, writeFile } from "../services/fs.service";
import { createAccessToken } from "../services/tokens.service";


const AT_FILENAME = 'access_tokens.json';
const FSCONFIG: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: AT_FILENAME,
    format: 'json',
}

//  Создать токен доступа для пользователя
export async function createAccessTokenForUser(userId: number, payload: any) {
    try {
        
    } catch (err) {
        console.error(err);
        throw err;
    }

}