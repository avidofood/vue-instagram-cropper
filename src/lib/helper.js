export function exists(obj, key) {
    if (!obj) return false;

    const temp = Object.prototype.hasOwnProperty;

    return temp.call(obj, key);
}

export function has(obj, key) {
    return exists(obj, key) && Boolean(obj[key]);
}

export function countObject(obj) {
    return Object.keys(obj).length;
}
