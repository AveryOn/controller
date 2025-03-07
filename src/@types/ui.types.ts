
/**
 * Названия цветовых тем приложения
 */
export enum Themes {
    dark = 'theme-dark',
    light = 'theme-light',
    darkContrast = 'theme-dark-contrast',
}

export type ThemesKey = keyof typeof Themes;

/**
 * Названия цветовых палитр
 */
export enum Palettes {
    red = 'palette-red',
    purple = 'palette-purple',
}

export type PalettesKey = keyof typeof Palettes;