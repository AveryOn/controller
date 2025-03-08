import { LocalVars } from "../@types/main.types"
import { Palettes, PalettesKey, Themes, ThemesKey } from "../@types/ui.types"

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

/**
 * Установить тему оформления для приложения
 */
export function setTheme(theme: ThemesKey) {
    document.documentElement.classList.forEach((el) => {
        if(el.includes('theme')) {
            document.documentElement.classList.remove(el)
        }
    })
    document.documentElement.classList.add(Themes[theme])
}


/**
 * Установить цветовую палитру для приложения
 */
export function setPalette(palette: PalettesKey) {
    document.documentElement.classList.forEach((el) => {
        if(el.includes('palette')) {
            document.documentElement.classList.remove(el)
        }
    })
    document.documentElement.classList.add(Palettes[palette])
}
