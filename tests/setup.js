import { afterEach } from 'vitest';
import { markRaw } from 'vue';
import { enableAutoUnmount } from '@vue/test-utils';

// Server-side tests (// @vitest-environment node) run without a DOM and need no stubs
const installBrowserStubs = () => {
    // jsdom has no canvas and loads no images. These stubs stand in for the browser.

    // A URL with a size such as /photo-800x600.jpg gives an image of 800 x 600 pixels.
    // Other images, for example the data URL of a chosen file, are 1000 x 500 pixels.
    const sizeOf = (src) => {
        const match = /^(?!data:).*?(\d+)x(\d+)/.exec(src);
        return match ? [Number(match[1]), Number(match[2])] : [1000, 500];
    };

    const src = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');

    // Loads the image in the next task. A URL with "broken" in it fails.
    // A URL such as /photo-800x600-delay-200.jpg loads after 200ms.
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        get() {
            return src.get.call(this);
        },
        set(value) {
            src.set.call(this, value);
            this.loadedSize = null;
            const delay = /delay-(\d+)/.exec(value);
            setTimeout(() => {
                if (value.includes('broken')) {
                    this.dispatchEvent(new Event('error'));
                    return;
                }
                this.loadedSize = sizeOf(value);
                this.dispatchEvent(new Event('load'));
            }, delay ? Number(delay[1]) : 0);
        },
    });

    Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
        configurable: true,
        get() {
            return this.loadedSize ? this.loadedSize[0] : 0;
        },
    });

    Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
        configurable: true,
        get() {
            return this.loadedSize ? this.loadedSize[1] : 0;
        },
    });

    // A 2D context that records every call, for example ['drawImage', img, 0, 75, 600, 450].
    // Vue does not wrap a real context in a reactive proxy, so markRaw() keeps this one raw too.
    const createContext = (canvas) => {
        const context = markRaw({ canvas, calls: [] });
        [
            'arc', 'beginPath', 'clearRect', 'closePath', 'drawImage', 'fill', 'fillRect', 'fillText',
            'lineTo', 'moveTo', 'quadraticCurveTo', 'restore', 'rotate', 'save', 'scale', 'stroke',
            'translate',
        ].forEach((name) => {
            context[name] = (...args) => context.calls.push([name, ...args]);
        });
        return context;
    };

    HTMLCanvasElement.prototype.getContext = function getContext() {
        if (!this.context) this.context = createContext(this);
        return this.context;
    };

    // The output describes the canvas, so tests can check the size of the result
    HTMLCanvasElement.prototype.toDataURL = function toDataURL(type = 'image/png', quality = 1) {
        return `data:${type};width=${this.width};height=${this.height};quality=${quality}`;
    };

    HTMLCanvasElement.prototype.toBlob = function toBlob(callback, type = 'image/png', quality = 1) {
        const { width, height } = this;
        setTimeout(() => {
            const blob = new Blob([`${width}x${height}`], { type });
            callback(Object.assign(blob, { width, height, quality }));
        });
    };

    // jsdom has no ResizeObserver. resizeContainer() in helpers.js calls the observers.
    globalThis.resizeObservers = new Set();
    globalThis.ResizeObserver = class ResizeObserver {
        constructor(callback) {
            this.callback = callback;
            this.targets = new Set();
        }

        observe(target) {
            this.targets.add(target);
            globalThis.resizeObservers.add(this);
        }

        unobserve(target) {
            this.targets.delete(target);
        }

        disconnect() {
            this.targets.clear();
            globalThis.resizeObservers.delete(this);
        }
    };
};

if (typeof window !== 'undefined') installBrowserStubs();

enableAutoUnmount(afterEach);

afterEach(() => {
    if (typeof document !== 'undefined') document.body.innerHTML = '';
});
