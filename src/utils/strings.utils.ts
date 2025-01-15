
// Форматирование строки для подразделов из меню материалов. ('to/path/filename  -> 'to>path>filename')
export function replacePathForMaterials(inp: string) {
    if(!inp || typeof inp !== 'string') throw TypeError('Аргумент inp должен быть типа string');
    try {
        return inp.split('/').join('>');
    } catch (err) {
        console.error('[replacePathForMaterials]>> Internal Error');
        throw err;
    }
}

// Обрезать строку пути по краям (./to/path/filename/  => to/path/filename)
export function trimPath(fullpath: string, config?: { split?: boolean, separator?: string }) {
    try {
        const symbols = `\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2A\x2B\x2C\x2D\x2E\x2F\x3A\x3B\x3C\x3D\x3E\x3F\x40\x5B\x5C\x5D\x5E\x5F\x60\x7B\x7C\x7D\x7E\x09\x0A\x0D\x0B\x0C`;
        const separator = config?.separator || '/';
        
        let pathChunks: string[] | undefined = fullpath?.split(separator);
        let correctFullPath: string;
        if(pathChunks.at(-1) === '') fullpath = fullpath.slice(0, -1);
        if(symbols.includes(pathChunks[0])) correctFullPath = fullpath.slice(2);
        else if(pathChunks[0] === '') correctFullPath = fullpath.slice(1) ;
        else correctFullPath = fullpath;
        pathChunks = undefined;
        if(config?.split === true) {
            console.log('correctFullPath', correctFullPath);
            return correctFullPath?.split(separator);
        }
        return correctFullPath;
    } catch (err) {
        console.error(err);
        throw err;
    }
}