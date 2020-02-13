export default {
    rAFPolyfill() {
        // rAF polyfill
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        let lastTime = 0;
        const vendors = ['webkit', 'moz'];
        for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
            window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`] // Webkit中此取消方法的名字变了
            || window[`${vendors[x]}CancelRequestAnimationFrame`];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function requestAnimationFrame(callback) {
                const currTime = new Date().getTime();
                const timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                const id = window.setTimeout(() => {
                    const arg = currTime + timeToCall;
                    callback(arg);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function cancelAnimationFrame(id) {
                clearTimeout(id);
            };
        }

        Array.isArray = function isArray(arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    },

    toBlobPolyfill() {
        if (typeof document === 'undefined' || typeof window === 'undefined' || !HTMLCanvasElement) return;
        let binStr;
        let len;
        let arr;
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
                value(callback, type, quality) {
                    binStr = atob(this.toDataURL(type, quality).split(',')[1]);
                    len = binStr.length;
                    arr = new Uint8Array(len);

                    for (let i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }

                    callback(new Blob([arr], { type: type || 'image/png' }));
                },
            });
        }
    },
};
