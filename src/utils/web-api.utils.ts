import { LocalVars } from "../@types/main.types"

/**
 * функция удаляет чувствительные данные с localStorage
 * * Ничего не принимает ничего не отдает
 */
export function clearSensitiveData() {
    localStorage.removeItem(LocalVars.userData)
    localStorage.removeItem(LocalVars.token)
    localStorage.removeItem(LocalVars.materialsFullLabel)
    localStorage.removeItem(LocalVars.currentRoute)
}