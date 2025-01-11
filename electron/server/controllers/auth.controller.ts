import { verifyAccessToken } from "../services/tokens.service";
import { ValidateAccessTokenParams } from "../types/controllers/auth.types";

// Валидация токена доступа
export async function validateAccessToken(params: ValidateAccessTokenParams) {
    console.log('[validateAccessToken] =>', params);
    try {
        if(!params?.token) throw '[validateAccessToken]>> INVALID_DATA';
        return await verifyAccessToken(params.token);
    } catch (err) {
        console.error(err);
        return false
    }
}