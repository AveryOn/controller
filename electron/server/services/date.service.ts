import moment from "moment";

// Форматирование даты по шаблону
export function formatDate(date?: Date | string | number, template?: string, utcOffset?: string) {
    try {
        if(!date) date = Date.now();
        if(!template) template = 'DD-MM-YYYY HH:mm:ss';
        if(!utcOffset) utcOffset = '+03:00';
        return moment(date).utcOffset(utcOffset).format(template);
    } catch (err) {
        console.error('[Service.formatDate]>> INTERNAL_ERROR', err);
        throw err;
    }
}