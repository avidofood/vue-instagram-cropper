import {
    describe, expect, it, vi,
} from 'vitest';
import InstagramCropper from '../src/index';
import {
    callsOf,
    collectErrors,
    landscapeUrl,
    lastDrawnImage,
    mountCropper,
    mountEmpty,
    mountWithImage,
    resizeContainer,
    sleep,
    waitForEvent,
} from './helpers';

describe('container size', () => {
    it('follows a container that changes its size', async () => {
        const wrapper = await mountWithImage();

        await resizeContainer(wrapper, 'width: 450px; height: 300px;');
        await sleep(50);

        const canvas = wrapper.find('canvas').element;
        expect([canvas.width, canvas.height]).toEqual([900, 600]);
        expect([canvas.style.width, canvas.style.height]).toEqual(['450px', '300px']);
        const [, , startX, startY, width, height] = lastDrawnImage(wrapper);
        // The landscape image fits the new canvas of 900 x 600 pixels
        expect([startX, startY, width, height]).toEqual([50, 0, 800, 600]);
    });

    // For example v-show in vue-cropgram: the browser reports a width such as 100% or auto
    it('places the image when a hidden container shows up', async () => {
        const wrapper = mountCropper({ src: landscapeUrl }, {
            attrs: { style: 'display: none; width: 100%; height: 100%;' },
        });
        await waitForEvent(wrapper, 'initial-image-loaded');
        await sleep(50);

        expect(wrapper.find('canvas').element.width).toBe(0);
        expect(callsOf(wrapper, 'drawImage')).toHaveLength(0);
        expect(wrapper.emitted('new-image-drawn')).toBeUndefined();

        await resizeContainer(wrapper, 'width: 300px; height: 300px;');
        await waitForEvent(wrapper, 'new-image-drawn');

        const [, , startX, startY, width, height] = lastDrawnImage(wrapper);
        expect([startX, startY, width, height]).toEqual([0, 75, 600, 450]);
        expect(wrapper.emitted('new-image-drawn')).toHaveLength(1);
        expect(wrapper.emitted('init')).toHaveLength(1);
        expect(wrapper.vm.loading).toBe(false);
    });

    it('draws the placeholder for the new size without starting again', async () => {
        const wrapper = await mountEmpty();

        await resizeContainer(wrapper, 'width: 200px; height: 100px;');

        expect(callsOf(wrapper, 'fillText').at(-1)).toEqual(['fillText', 'Choose an image', 200, 100]);
        expect(wrapper.emitted('init')).toHaveLength(1);
    });

    it('stops observing on unmount', async () => {
        const wrapper = await mountWithImage();
        expect(globalThis.resizeObservers.size).toBe(1);

        wrapper.unmount();

        expect(globalThis.resizeObservers.size).toBe(0);
    });

    // Many apps test their components in jsdom, which has no ResizeObserver
    it('works without ResizeObserver', async () => {
        const { ResizeObserver } = globalThis;
        delete globalThis.ResizeObserver;
        try {
            const wrapper = await mountWithImage();
            expect(wrapper.vm.hasImage()).toBe(true);
            wrapper.unmount();
        } finally {
            globalThis.ResizeObserver = ResizeObserver;
        }
    });
});

describe('output size', () => {
    // The visible image is 600 x 450 canvas pixels: landscapeUrl in a 300 x 300 container
    it.each([
        [{ width: 1080 }, 'width=1080;height=810'],
        [{ height: 900 }, 'width=1200;height=900'],
        [{ width: 1080, height: 1080 }, 'width=1080;height=810'],
        [{ maxWidth: 300 }, 'width=300;height=225'],
        [{ width: 2000, maxWidth: 1600 }, 'width=1600;height=1200'],
        [{ maxWidth: 1000, maxHeight: 300 }, 'width=400;height=300'],
        [{ width: -5, height: Number.NaN }, 'width=600;height=450'],
        [{}, 'width=600;height=450'],
    ])('generateDataUrl() with %j', async (options, size) => {
        const wrapper = await mountWithImage();

        expect(wrapper.vm.generateDataUrl('image/jpeg', 0.9, options))
            .toBe(`data:image/jpeg;${size};quality=0.9`);
    });

    it('draws the image scaled to the output size', async () => {
        const wrapper = await mountWithImage();
        wrapper.vm.zoom(true, 20);
        await sleep(50);
        const contexts = [];
        const { getContext } = HTMLCanvasElement.prototype;
        HTMLCanvasElement.prototype.getContext = function spy(...args) {
            const context = getContext.apply(this, args);
            contexts.push(context);
            return context;
        };
        try {
            const { imgData } = wrapper.vm.getMetadata();
            wrapper.vm.generateDataUrl('image/png', 1, { width: 1200 });

            const scale = 1200 / Math.min(imgData.width, 600);
            const draw = contexts.at(-1).calls.find((call) => call[0] === 'drawImage');
            expect(draw.slice(2)).toEqual([
                Math.min(imgData.startX, 0) * scale,
                Math.min(imgData.startY, 0) * scale,
                imgData.width * scale,
                imgData.height * scale,
            ]);
        } finally {
            HTMLCanvasElement.prototype.getContext = getContext;
        }
    });

    it('generateBlob() and promisedBlob() take the options', async () => {
        const wrapper = await mountWithImage();

        const blob = await wrapper.vm.promisedBlob('image/jpeg', 0.8, { width: 1080 });
        const viaCallback = await new Promise((resolve) => {
            wrapper.vm.generateBlob(resolve, 'image/webp', 0.7, { maxHeight: 225 });
        });

        expect([blob.width, blob.height, blob.type]).toEqual([1080, 810, 'image/jpeg']);
        expect([viaCallback.width, viaCallback.height]).toEqual([300, 225]);
    });

    it('saving() takes the options', async () => {
        const wrapper = await mountWithImage();
        const { img } = wrapper.vm.getMetadata();
        const imgData = {
            width: 1200, height: 900, startX: -300, startY: -150,
        };

        const blob = await wrapper.vm
            .saving(img, imgData, wrapper.vm.outputWidth, wrapper.vm.outputHeight)
            .promisedBlob('image/jpeg', 0.8, { width: 1080 });

        expect([blob.width, blob.height]).toEqual([1080, 1080]);
    });

    it('promisedBlob() resolves with null without an image, also with options', async () => {
        const wrapper = await mountEmpty();

        await expect(wrapper.vm.promisedBlob('image/png', 1, { width: 1080 })).resolves.toBeNull();
    });
});

// The rule-of-thirds grid has four lines, each line is one stroke()
const strokesAfterLastImage = (wrapper) => {
    const { calls } = wrapper.find('canvas').element.getContext('2d');
    const last = calls.map((call) => call[0]).lastIndexOf('drawImage');
    return calls.slice(last).filter((call) => call[0] === 'stroke').length;
};

describe('grid', () => {
    it('shows the grid while the user zooms and hides it after a moment', async () => {
        const wrapper = await mountWithImage();

        await wrapper.find('canvas').trigger('wheel', { deltaY: -100 });
        await waitForEvent(wrapper, 'zoom');
        await sleep(50);
        expect(strokesAfterLastImage(wrapper)).toBe(4);

        await sleep(600);
        expect(strokesAfterLastImage(wrapper)).toBe(0);
    });

    it('shows the grid while the user drags', async () => {
        const wrapper = await mountWithImage();
        const canvas = wrapper.find('canvas');

        await canvas.trigger('mousedown', { clientX: 100, clientY: 100 });
        await canvas.trigger('mousemove', { clientX: 110, clientY: 100 });
        await sleep(50);

        expect(strokesAfterLastImage(wrapper)).toBe(4);
    });

    it('showGrid false hides the grid', async () => {
        const wrapper = await mountWithImage({ showGrid: false });
        const canvas = wrapper.find('canvas');

        await canvas.trigger('mousedown', { clientX: 100, clientY: 100 });
        await canvas.trigger('mousemove', { clientX: 110, clientY: 100 });
        await canvas.trigger('wheel', { deltaY: -100 });
        await sleep(50);

        expect(callsOf(wrapper, 'stroke')).toHaveLength(0);
    });

    it('stops the grid timer on unmount', async () => {
        const errors = collectErrors();
        const wrapper = await mountWithImage();
        await wrapper.find('canvas').trigger('wheel', { deltaY: -100 });

        wrapper.unmount();
        await sleep(600);

        expect(errors).toEqual([]);
    });
});

describe('zoomOnWheel', () => {
    const wheel = (wrapper) => {
        const event = new WheelEvent('wheel', { deltaY: -100, cancelable: true, bubbles: true });
        wrapper.find('canvas').element.dispatchEvent(event);
        return event;
    };

    it('zooms and keeps the page from scrolling by default', async () => {
        const wrapper = await mountWithImage();
        const { scaleRatio } = wrapper.vm;

        const event = wheel(wrapper);
        await sleep(50);

        expect(event.defaultPrevented).toBe(true);
        expect(wrapper.vm.scaleRatio).toBeGreaterThan(scaleRatio);
    });

    it('false lets the page scroll and does not zoom', async () => {
        const wrapper = await mountWithImage({ zoomOnWheel: false });
        const { scaleRatio } = wrapper.vm;

        const event = wheel(wrapper);
        await sleep(50);

        expect(event.defaultPrevented).toBe(false);
        expect(wrapper.vm.scaleRatio).toBe(scaleRatio);
        expect(wrapper.emitted('zoom')).toBeUndefined();
        // The component still emits the wheel event
        expect(wrapper.emitted('wheel')).toHaveLength(1);
    });
});

describe('crossOrigin', () => {
    it('loads a remote image with anonymous by default', async () => {
        const wrapper = await mountWithImage();

        expect(lastDrawnImage(wrapper)[1].getAttribute('crossOrigin')).toBe('anonymous');
    });

    // For an image server that needs the cookies of the user
    it('use-credentials sends the cookies', async () => {
        const wrapper = await mountWithImage({ crossOrigin: 'use-credentials' });

        expect(lastDrawnImage(wrapper)[1].getAttribute('crossOrigin')).toBe('use-credentials');
    });

    it('rejects another value', () => {
        const { crossOrigin } = InstagramCropper.props;

        expect(crossOrigin.validator('anonymous')).toBe(true);
        expect(crossOrigin.validator('use-credentials')).toBe(true);
        expect(crossOrigin.validator('')).toBe(false);
    });
});

describe('keyboard', () => {
    const press = (wrapper, key, options = {}) => {
        const event = new KeyboardEvent('keydown', {
            key, cancelable: true, bubbles: true, ...options,
        });
        wrapper.find('canvas').element.dispatchEvent(event);
        return event;
    };

    // Zoomed in, so the image can move in every direction
    const mountZoomed = async () => {
        const wrapper = await mountWithImage();
        wrapper.vm.zoom(true, 20);
        await sleep(50);
        return wrapper;
    };

    it('the canvas can get the focus', async () => {
        const wrapper = await mountEmpty();

        expect(wrapper.find('canvas').attributes('tabindex')).toBe('0');
        // Screen readers pass the arrow keys to an element with the role application
        expect(wrapper.find('canvas').attributes('role')).toBe('application');
        // The hidden file input is no extra tab stop without a visible focus
        expect(wrapper.find('input[type="file"]').attributes('tabindex')).toBe('-1');
    });

    it('arrow keys move the image, Shift moves it further', async () => {
        const wrapper = await mountZoomed();
        const { startX, startY } = wrapper.vm.imgData;

        const event = press(wrapper, 'ArrowLeft');
        press(wrapper, 'ArrowUp', { shiftKey: true });
        await sleep(50);

        expect(event.defaultPrevented).toBe(true);
        // 10 pixels in the container, times the quality of 2. Shift: 50 pixels.
        expect(wrapper.vm.imgData.startX).toBe(startX - 20);
        expect(wrapper.vm.imgData.startY).toBeLessThan(startY);
        expect(wrapper.emitted('move').length).toBeGreaterThan(0);
    });

    it('plus and minus zoom the image', async () => {
        const wrapper = await mountZoomed();
        const { scaleRatio } = wrapper.vm;

        press(wrapper, '+');
        await sleep(50);
        const zoomedIn = wrapper.vm.scaleRatio;
        press(wrapper, '-');
        press(wrapper, '-');
        await sleep(50);

        expect(zoomedIn).toBeGreaterThan(scaleRatio);
        expect(wrapper.vm.scaleRatio).toBeLessThan(zoomedIn);
        expect(wrapper.emitted('zoom').length).toBeGreaterThan(0);
    });

    it('Enter opens the file chooser without an image', async () => {
        const wrapper = await mountEmpty();
        const click = vi.spyOn(wrapper.find('input[type="file"]').element, 'click');

        const event = press(wrapper, 'Enter');

        expect(event.defaultPrevented).toBe(true);
        expect(click).toHaveBeenCalledTimes(1);
    });

    it('leaves other keys and shortcuts to the page', async () => {
        const wrapper = await mountZoomed();
        const { startX } = wrapper.vm.imgData;

        const tab = press(wrapper, 'Tab');
        const shortcut = press(wrapper, 'ArrowLeft', { ctrlKey: true });
        await sleep(50);

        expect(tab.defaultPrevented).toBe(false);
        expect(shortcut.defaultPrevented).toBe(false);
        expect(wrapper.vm.imgData.startX).toBe(startX);
    });
});

describe('labels', () => {
    it('names the canvas and the buttons', async () => {
        const wrapper = await mountWithImage();

        expect(wrapper.find('canvas').attributes('aria-label')).toMatch(/^Image cropper\./);
        expect(wrapper.find('.top-right-abs').attributes('aria-label')).toBe('Remove image');
        expect(wrapper.find('.bottom-left-abs').attributes('aria-label')).toBe('Fit or fill the image');
    });

    it('labels replaces single texts, for example for another language', async () => {
        const wrapper = await mountWithImage({ labels: { remove: 'Bild entfernen' } });

        expect(wrapper.find('.top-right-abs').attributes('aria-label')).toBe('Bild entfernen');
        expect(wrapper.find('.bottom-left-abs').attributes('aria-label')).toBe('Fit or fill the image');
    });
});

describe('output size with a fixed aspect ratio', () => {
    // A 4:5 container with preventWhiteSpace. The image height is 799.99... after the watchers,
    // because 600 * (800 / 600) is not exact in floating point.
    it('counts a size such as 799.99999 as 800 pixels', async () => {
        const wrapper = await mountWithImage({ preventWhiteSpace: true }, {
            attrs: { style: 'width: 320px; height: 400px;' },
        });

        expect(wrapper.vm.generateDataUrl()).toBe('data:image/png;width=640;height=800;quality=1');
        expect(wrapper.vm.generateDataUrl('image/jpeg', 0.9, { width: 1080 }))
            .toBe('data:image/jpeg;width=1080;height=1350;quality=0.9');
    });

    // A partly covered last row would be transparent in a PNG and dark in a JPEG
    it('cuts a real fraction off, as 1.x did', async () => {
        const wrapper = await mountWithImage();
        wrapper.vm.zoom(true, 1);
        await sleep(50);
        const { height } = wrapper.vm.getMetadata().imgData;
        expect(height % 1).toBeGreaterThan(0.01);

        expect(wrapper.vm.generateDataUrl()).toBe(`data:image/png;width=600;height=${Math.floor(height)};quality=1`);
    });
});
