// Сервис для работы со строками

// Обрезать строку пути по краям (./to/path/filename/  => to/path/filename)
export function trimPath(fullpath: string, config?: { split?: boolean, separator?: string }) {
    const symbols = `\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2A\x2B\x2C\x2D\x2E\x2F\x3A\x3B\x3C\x3D\x3E\x3F\x40\x5B\x5C\x5D\x5E\x5F\x60\x7B\x7C\x7D\x7E\x09\x0A\x0D\x0B\x0C`;
    const separator = config?.separator || '/';
    let pathChunks: string[] | undefined = fullpath.split(separator);
    let correctFullPath: string;
    if(pathChunks.at(-1) === '') fullpath = fullpath.slice(0, -1);
    if(symbols.includes(pathChunks[0])) correctFullPath = fullpath.slice(2);
    else if(pathChunks[0] === '') correctFullPath = fullpath.slice(1) ;
    else correctFullPath = fullpath;
    pathChunks = undefined;
    if(config?.split === true) {
        return correctFullPath.split(separator);
    }
    return correctFullPath;
}

// Извлечь только слова или буквы из строки
export function excludesWords(inp: string, config?: { joinBy?: string }): string | string[] {
    try {
        const specSymbols = `\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2A\x2B\x2C\x2D\x2E\x2F\x3A\x3B\x3C\x3D\x3E\x3F\x40\x5B\x5C\x5D\x5E\x5F\x60\x7B\x7C\x7D\x7E\x09\x0A\x0D\x0B\x0C`;
        let excluded: string[] = [];
        let currentWord: string = '';
        for (let i = 0; i < inp.length; i++) {
            const char = inp[i];
            // Если на пути встречается спец.символ
            if(specSymbols.includes(char)) {
                if(currentWord !== '') {
                    excluded.push(currentWord);
                    currentWord = '';
                }
            } else {
                currentWord+=char;
            }
        }
        if(config?.joinBy) {
            return excluded.join(config.joinBy);
        }
        return excluded;
    } catch (err) {
        console.error(err);
        throw err;
    }
}