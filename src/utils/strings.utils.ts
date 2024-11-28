
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