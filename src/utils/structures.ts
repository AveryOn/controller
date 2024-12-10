
// Сортировка слиянием
export function sortedMerge<T>(array: Array<T>, key?: keyof T, direction?: 'least' | 'greater'): Array<T> {
    const n = array.length;
    for (let size = 1; size < n; size *= 2) {
        for(let i = 0; i < n; i += size*2) {
            let left = i;
            let mid = Math.min(n, i+size);
            let right = Math.min(n, i+size*2);
            merge<T>(array, left, mid, right, key, direction);
        }        
    }
    return array;
}

function compareValues(first: any, second: any, direction?: 'least' | 'greater') {
    // Сортировка по убыванию
    if(direction === 'least') return first >= second;
    // Сортировка по возрастанию
    else return first <= second;
}

function merge<T>(array: T[], left: number, mid: number, right: number, key?: keyof T, direction?: 'least' | 'greater') {
    let temp = [];
    let i: number = left
    let j: number = mid;
    while(i < mid && j < right) {
        if(key) {
            if(compareValues(array[i][key], array[j][key], direction)) {
                temp.push(array[i]);
                i++;
            }
            else {
                temp.push(array[j]);
                j++;
            }  
        }
        else {
            if(compareValues(array[i], array[j], direction)) {
                temp.push(array[i]);
                i++;
            }
            else {
                temp.push(array[j]);
                j++;
            }
        }
    }
    while(i < mid) {
        temp.push(array[i]);
        i++;
    }
    while(j < right) {
        temp.push(array[j]);
        j++;
    }
    for (let k = 0; k < temp.length; k++) {
        array[left+k] = temp[k];
    }
}