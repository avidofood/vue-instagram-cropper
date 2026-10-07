import {
    describe, expect, it, vi,
} from 'vitest';
import {
    chooseFile,
    imageFile,
    landscapeUrl,
    lastDrawnImage,
    mountCropper,
    mountEmpty,
    mountWithImage,
    portraitUrl,
    waitForEvent,
} from './helpers';

// A JPEG header with an EXIF block: orientation 6, the camera was turned 90 degrees
const exifOrientation6 = [
    0xFF, 0xD8,
    0xFF, 0xE1, 0x00, 0x22,
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
    0x00, 0x01,
    0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0xFF, 0xD9,
];

describe('EXIF orientation (#17)', () => {
    // Browsers apply the EXIF orientation themselves since 2020: Chrome 81, Firefox 77,
    // Safari 13.1. naturalWidth and drawImage() already use the turned image.
    it('draws a chosen file without turning it a second time', async () => {
        const wrapper = await mountEmpty();

        await chooseFile(wrapper, imageFile('turned.jpg', exifOrientation6));
        await waitForEvent(wrapper, 'new-image-drawn');

        const [, img, startX, startY, width, height] = lastDrawnImage(wrapper);
        expect(img.src).toMatch(/^data:image\/jpeg;base64,/);
        // 1000 x 500 pixels fill the canvas of 600 x 600 pixels
        expect([startX, startY, width, height]).toEqual([-300, 0, 1200, 600]);
    });
});

describe('several croppers on one page', () => {
    // 1.x returned the same data object for every cropper
    it('each cropper has its own state', async () => {
        const first = await mountWithImage();
        const second = await mountEmpty();

        expect(first.vm.hasImage()).toBe(true);
        expect(second.vm.hasImage()).toBe(false);
        expect(second.vm.img).toBeNull();
        expect(second.vm.imgData).not.toBe(first.vm.imgData);
    });

    // 1.x shared one debounce timer, so only the last cropper loaded its image
    it('croppers that mount at the same time load their own images', async () => {
        const first = mountCropper({ src: landscapeUrl });
        const second = mountCropper({ src: portraitUrl });

        await waitForEvent(first, 'new-image-drawn');
        await waitForEvent(second, 'new-image-drawn');

        expect(lastDrawnImage(first)[1].src).toBe(landscapeUrl);
        expect(lastDrawnImage(second)[1].src).toBe(portraitUrl);
    });
});

describe('listeners', () => {
    it('removes the document listeners when the pointer goes up', async () => {
        const wrapper = await mountWithImage();
        const canvas = wrapper.find('canvas');

        await canvas.trigger('mousedown', { clientX: 10, clientY: 10 });
        await canvas.trigger('mouseup', { clientX: 10, clientY: 10 });
        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(wrapper.emitted('mouseup')).toHaveLength(1);
    });

    it('ends a drag when the pointer goes up outside the canvas', async () => {
        const wrapper = await mountWithImage();

        await wrapper.find('canvas').trigger('mousedown', { clientX: 10, clientY: 10 });
        document.dispatchEvent(new MouseEvent('mouseup'));

        expect(wrapper.vm.dragging).toBe(false);
    });

    it('removes the resize and document listeners on unmount', async () => {
        const wrapper = await mountWithImage();
        await wrapper.find('canvas').trigger('mousedown', { clientX: 10, clientY: 10 });
        const { vm } = wrapper;
        const removeWindow = vi.spyOn(window, 'removeEventListener');
        const removeDocument = vi.spyOn(document, 'removeEventListener');

        wrapper.unmount();

        expect(removeWindow).toHaveBeenCalledWith('resize', vm.$_c_setContainerSize);
        expect(removeDocument).toHaveBeenCalledWith('mouseup', vm.$_c_handlePointerEnd);
    });

    it('a pending image load does not throw after unmount', () => {
        vi.useFakeTimers();
        try {
            const wrapper = mountCropper();
            wrapper.unmount();

            expect(() => vi.advanceTimersByTime(100)).not.toThrow();
        } finally {
            vi.useRealTimers();
        }
    });
});

describe('output without an image', () => {
    it('promisedBlob() resolves with null', async () => {
        const wrapper = await mountEmpty();

        await expect(wrapper.vm.promisedBlob()).resolves.toBeNull();
    });
});

describe('forceCacheBreak', () => {
    it('works with a relative URL', async () => {
        const wrapper = mountCropper({ src: '/images/photo-800x600.jpg', forceCacheBreak: true });
        await waitForEvent(wrapper, 'new-image-drawn');

        const url = new URL(lastDrawnImage(wrapper)[1].src);
        expect(url.origin).toBe(window.location.origin);
        expect(url.pathname).toBe('/images/photo-800x600.jpg');
        expect(url.searchParams.get('cors')).toMatch(/^\d+$/);
    });

    it('keeps a data URL', async () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
        const wrapper = mountCropper({ src: dataUrl, forceCacheBreak: true });
        await waitForEvent(wrapper, 'new-image-drawn');

        const img = lastDrawnImage(wrapper)[1];
        expect(img.src).toBe(dataUrl);
        expect(img.hasAttribute('crossOrigin')).toBe(false);
    });
});

describe('drag and drop', () => {
    const dataTransfer = (file) => ({
        types: ['Files'],
        items: [{ kind: 'file', getAsFile: () => file }],
    });

    it('marks the container while a file is over it', async () => {
        const wrapper = await mountEmpty();

        await wrapper.trigger('dragenter', { dataTransfer: dataTransfer() });
        expect(wrapper.classes()).toContain('cropper--dropzone');

        await wrapper.trigger('dragleave', { dataTransfer: dataTransfer() });
        expect(wrapper.classes()).not.toContain('cropper--dropzone');
    });

    it('loads a dropped file', async () => {
        const wrapper = await mountEmpty();
        const file = imageFile();

        await wrapper.trigger('dragenter', { dataTransfer: dataTransfer(file) });
        await wrapper.trigger('drop', { dataTransfer: dataTransfer(file) });
        await waitForEvent(wrapper, 'new-image-drawn');

        expect(wrapper.emitted('file-choose')[0]).toEqual([file]);
        expect(wrapper.classes()).not.toContain('cropper--dropzone');
    });
});

describe('zoom with preventWhiteSpace', () => {
    // Vue 3 runs the watchers in another order than Vue 2. Without the limit in zoom(), the
    // component emitted zoom twice for every wheel step, although the image did not change.
    it('emits no zoom event when the image cannot get smaller', async () => {
        const wrapper = await mountWithImage({ preventWhiteSpace: true });
        const { imgData } = wrapper.vm.getMetadata();

        await wrapper.find('canvas').trigger('wheel', { deltaY: 100 });
        await new Promise((resolve) => { setTimeout(resolve, 50); });

        expect(wrapper.emitted('zoom')).toBeUndefined();
        expect(wrapper.vm.getMetadata().imgData).toEqual(imgData);
    });

    it('zooms out down to the size that fills the canvas', async () => {
        const wrapper = await mountWithImage({ preventWhiteSpace: true });
        wrapper.vm.zoom(true, 20);
        await new Promise((resolve) => { setTimeout(resolve, 50); });
        const zooms = wrapper.emitted('zoom').length;

        wrapper.vm.zoom(false, 20);
        await new Promise((resolve) => { setTimeout(resolve, 50); });

        expect(wrapper.vm.scaleRatio).toBe(1);
        expect(wrapper.vm.imgData.width).toBe(800);
        expect(wrapper.emitted('zoom')).toHaveLength(zooms + 1);
    });
});
