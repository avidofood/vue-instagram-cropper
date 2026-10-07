import { describe, expect, it } from 'vitest';
import {
    callsOf,
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
