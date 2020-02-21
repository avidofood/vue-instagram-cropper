// https://github.com/vuejs-tips/tiny-debounce/blob/master/index.js

export default function debounce(fn, delay) {
    let timeoutID = null;
    return function debounceTieout(...args) {
        clearTimeout(timeoutID);
        const that = this;
        timeoutID = setTimeout(() => {
            fn.apply(that, args);
        }, delay);
    };
}
