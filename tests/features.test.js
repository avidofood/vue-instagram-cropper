import { describe, expect, it } from 'vitest';
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
