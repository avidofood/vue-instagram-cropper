// https://github.com/vuejs-tips/tiny-debounce/blob/master/index.js

export default function debounce(fn, delay) {
    let timeoutID = null;
    const debounced = function debounceTimeout(...args) {
        clearTimeout(timeoutID);
        const that = this;
        timeoutID = setTimeout(() => {
            fn.apply(that, args);
        }, delay);
    };
    debounced.cancel = () => clearTimeout(timeoutID);
    return debounced;
}
