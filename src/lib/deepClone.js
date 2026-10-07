export default function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
