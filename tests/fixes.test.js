import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import {
    describe, expect, it, vi,
} from 'vitest';
import InstagramCropper from '../src/index';
import {
    callsOf,
    chooseFile,
    collectErrors,
    imageFile,
    landscapeUrl,
    lastDrawnImage,
    loadImage,
    mountCropper,
    mountEmpty,
    mountWithImage,
    portraitUrl,
    sleep,
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

    it('removes the resize observer and the document listeners on unmount', async () => {
        const wrapper = await mountWithImage();
        await wrapper.find('canvas').trigger('mousedown', { clientX: 10, clientY: 10 });
        const { vm } = wrapper;
        const removeDocument = vi.spyOn(document, 'removeEventListener');

        wrapper.unmount();

        expect(globalThis.resizeObservers.size).toBe(0);
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

    // The browser resolves a relative src against document.baseURI, which a <base> element sets
    it('resolves a relative URL against the <base> element like the browser', async () => {
        const base = document.createElement('base');
        base.href = 'https://cdn.example.com/assets/';
        document.head.appendChild(base);
        try {
            const plain = mountCropper({ src: 'images/photo-800x600.jpg' });
            const broken = mountCropper({ src: 'images/photo-800x600.jpg', forceCacheBreak: true });
            await waitForEvent(plain, 'new-image-drawn');
            await waitForEvent(broken, 'new-image-drawn');

            const url = new URL(lastDrawnImage(broken)[1].src);
            expect(lastDrawnImage(plain)[1].src).toBe('https://cdn.example.com/assets/images/photo-800x600.jpg');
            expect(`${url.origin}${url.pathname}`).toBe('https://cdn.example.com/assets/images/photo-800x600.jpg');
            expect(url.searchParams.get('cors')).toMatch(/^\d+$/);
        } finally {
            base.remove();
        }
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

describe('images that load while something changes', () => {
    it('ignores a slow image after src changed', async () => {
        const slowUrl = 'https://example.com/slow-800x600-delay-200.jpg';
        const wrapper = mountCropper({ src: slowUrl });
        await waitForEvent(wrapper, 'loading-start');

        await wrapper.setProps({ src: portraitUrl });
        await waitForEvent(wrapper, 'new-image-drawn');
        await sleep(300);

        expect(lastDrawnImage(wrapper)[1].src).toBe(portraitUrl);
        expect(wrapper.vm.getMetadata().img.src).toBe(portraitUrl);
        expect(wrapper.emitted('new-image-drawn')).toHaveLength(1);
    });

    it('ignores an image that finishes loading after the unmount', async () => {
        const errors = collectErrors();
        const wrapper = await mountWithImage();
        await wrapper.setProps({ src: 'https://example.com/slow-600x800-delay-100.jpg' });
        // The first loading-start came from the first image
        await waitForEvent(wrapper, 'loading-start', 2);

        wrapper.unmount();
        await sleep(200);

        expect(errors).toEqual([]);
    });

    it('ignores a chosen file that finishes loading after the unmount', async () => {
        const errors = collectErrors();
        const wrapper = await mountWithImage();
        await chooseFile(wrapper, imageFile());

        wrapper.unmount();
        await sleep(100);

        expect(errors).toEqual([]);
    });

    it('ignores a slow image after the user chose a file', async () => {
        const wrapper = mountCropper({ src: 'https://example.com/slow-800x600-delay-200.jpg' });
        await waitForEvent(wrapper, 'loading-start');

        await chooseFile(wrapper, imageFile());
        await waitForEvent(wrapper, 'new-image-drawn');
        await sleep(300);

        expect(wrapper.vm.getMetadata().img.src).toMatch(/^data:image\/jpeg;base64,/);
    });
});

describe('switching metadata', () => {
    // vue-cropgram switches between saved crops. Two photos can have the same size and crop.
    it('draws the new image when only the image changes', async () => {
        const first = await loadImage('https://example.com/first-800x600.jpg');
        const second = await loadImage('https://example.com/second-800x600.jpg');
        // A crop that the bounce check keeps as it is
        const crop = {
            imgData: {
                width: 900, height: 675, startX: -150, startY: -40,
            },
            scaleRatio: 1.125,
        };
        const wrapper = mountCropper({ src: { img: first, ...crop } });
        await waitForEvent(wrapper, 'update');

        await wrapper.setProps({ src: { img: second, ...crop } });
        await vi.waitFor(() => expect(lastDrawnImage(wrapper)[1]).toBe(second));

        expect(wrapper.vm.getMetadata().img).toBe(second);
    });
});

describe('maximum zoom with preventWhiteSpace', () => {
    // For a narrow image, the size that fills the canvas is larger than the maximum zoom
    it('keeps a narrow image filling the canvas', async () => {
        const wrapper = await mountWithImage({
            src: 'https://example.com/narrow-100x1000.jpg',
            preventWhiteSpace: true,
        });
        const { imgData } = wrapper.vm.getMetadata();
        expect(imgData.width).toBe(600);

        await wrapper.find('canvas').trigger('wheel', { deltaY: 100 });
        await sleep(50);

        expect(wrapper.vm.getMetadata().imgData).toEqual(imgData);
        expect(wrapper.emitted('zoom')).toBeUndefined();
    });

    it('keeps a narrow image filling the canvas when the user zooms in', async () => {
        const wrapper = await mountWithImage({
            src: 'https://example.com/narrow-100x1000.jpg',
            preventWhiteSpace: true,
        });

        await wrapper.find('canvas').trigger('wheel', { deltaY: -100 });
        await sleep(50);

        expect(wrapper.vm.imgData.width).toBeGreaterThanOrEqual(600);
        expect(wrapper.vm.imgData.startX).toBeLessThanOrEqual(0);
        expect(wrapper.vm.imgData.startX + wrapper.vm.imgData.width).toBeGreaterThanOrEqual(600);
    });
});

describe('metadata without an image', () => {
    it('getMetadata() returns img null after remove()', async () => {
        const wrapper = await mountWithImage();

        wrapper.vm.remove();
        await sleep(50);

        const metadata = wrapper.vm.getMetadata();
        expect(metadata.img).toBeNull();
        expect(metadata.imgData).toEqual({
            width: 0, height: 0, startX: 0, startY: 0,
        });
        // The types allow a number or null here, as in 1.x
        expect(metadata.scaleRatio === null || typeof metadata.scaleRatio === 'number').toBe(true);
    });

    it('a pending update after remove() carries img null, as in 1.x', async () => {
        const wrapper = await mountWithImage();
        const updates = wrapper.emitted('update').length;

        const draws = wrapper.emitted('draw').length;

        wrapper.vm.move({ x: -10, y: 0 });
        // The component draws in the next animation frame and emits update 20ms later
        await nextTick();
        await new Promise((resolve) => { requestAnimationFrame(resolve); });
        expect(wrapper.emitted('draw').length).toBeGreaterThan(draws);
        wrapper.vm.remove();
        await sleep(50);

        const last = wrapper.emitted('update').at(-1)[0];
        expect(wrapper.emitted('update').length).toBeGreaterThan(updates);
        expect(last.img).toBeNull();
    });
});

describe('metadata with preventWhiteSpace', () => {
    // For example a crop from a larger canvas. 1.x showed the image filled and centered.
    it('fills the canvas when the crop is smaller than the canvas', async () => {
        const img = await loadImage(landscapeUrl);
        const wrapper = mountCropper({
            preventWhiteSpace: true,
            src: {
                img,
                imgData: {
                    width: 600, height: 450, startX: 0, startY: 75,
                },
                scaleRatio: 0.75,
            },
        });
        await waitForEvent(wrapper, 'update');
        await sleep(50);

        expect(wrapper.vm.getMetadata().imgData).toEqual({
            width: 800, height: 600, startX: -100, startY: 0,
        });
        expect(wrapper.vm.scaleRatio).toBe(1);
        expect(wrapper.emitted('initial-image-loaded')).toHaveLength(1);
    });

    it('keeps a crop that fills the canvas', async () => {
        const img = await loadImage(landscapeUrl);
        const imgData = {
            width: 900, height: 675, startX: -150, startY: -40,
        };
        const wrapper = mountCropper({
            preventWhiteSpace: true,
            src: { img, imgData, scaleRatio: 1.125 },
        });
        await waitForEvent(wrapper, 'update');
        await sleep(50);

        expect(wrapper.vm.getMetadata().imgData).toEqual(imgData);
    });
});

describe('a parent that writes update back to src', () => {
    // <InstagramCropper :src="crop" @update="crop = $event" /> settled in 1.x
    it('settles and stops emitting update', async () => {
        const Parent = {
            components: { InstagramCropper },
            data: () => ({ crop: landscapeUrl, updates: 0 }),
            template: `<InstagramCropper
                style="width: 300px; height: 300px;"
                :src="crop"
                @update="crop = $event; updates += 1"
            />`,
        };
        const wrapper = mount(Parent, { attachTo: document.body });
        await vi.waitFor(() => expect(wrapper.vm.updates).toBeGreaterThan(0));
        await sleep(200);
        const { updates } = wrapper.vm;

        await sleep(300);

        expect(wrapper.vm.updates).toBe(updates);
        expect(updates).toBeLessThanOrEqual(3);
    });
});

describe('changes during the 30ms before a new src loads', () => {
    it('ignores the old image when it finishes in that time', async () => {
        vi.useFakeTimers();
        try {
            const slowUrl = 'https://example.com/old-800x600-delay-20.jpg';
            const wrapper = mountCropper({ src: slowUrl });
            await vi.advanceTimersByTimeAsync(31);

            // The old image finishes 20ms later, before the new src starts to load
            const newUrl = 'https://example.com/new-600x800-delay-100.jpg';
            await wrapper.setProps({ src: newUrl });
            await vi.advanceTimersByTimeAsync(300);

            const drawn = callsOf(wrapper, 'drawImage').map((call) => call[1].src);
            expect(drawn).not.toContain(slowUrl);
            expect(drawn.at(-1)).toBe(newUrl);
            expect(wrapper.emitted('new-image-drawn')).toHaveLength(1);
        } finally {
            vi.useRealTimers();
        }
    });

    it('remove() wins over a src that did not load yet', async () => {
        const wrapper = await mountWithImage();

        await wrapper.setProps({ src: portraitUrl });
        wrapper.vm.remove();
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(lastDrawnImage(wrapper)[1].src).toBe(landscapeUrl);
    });

    it('a chosen file wins over a src that did not load yet', async () => {
        const wrapper = await mountWithImage();

        await wrapper.setProps({ src: portraitUrl });
        await chooseFile(wrapper, imageFile());
        await waitForEvent(wrapper, 'new-image-drawn', 2);
        await sleep(100);

        expect(wrapper.vm.getMetadata().img.src).toMatch(/^data:image\/jpeg;base64,/);
    });
});

describe('remove() while an image loads', () => {
    it('stops the first image from showing up', async () => {
        const slowUrl = 'https://example.com/first-800x600-delay-100.jpg';
        const wrapper = mountCropper({ src: slowUrl });
        await waitForEvent(wrapper, 'loading-start');

        wrapper.vm.remove();
        await sleep(200);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(callsOf(wrapper, 'drawImage')).toHaveLength(0);
        expect(wrapper.vm.loading).toBe(false);
        expect(wrapper.emitted('loading-end')).toHaveLength(1);
    });

    it('ends the loading state of a replacement', async () => {
        const wrapper = await mountWithImage();
        await wrapper.setProps({ src: 'https://example.com/next-600x800-delay-100.jpg' });
        await waitForEvent(wrapper, 'loading-start', 2);

        wrapper.vm.remove();
        await sleep(200);

        expect(wrapper.vm.loading).toBe(false);
        expect(wrapper.emitted('loading-end')).toHaveLength(2);
        expect(wrapper.find('.cropper-spinner').exists()).toBe(false);
    });

    it('src null ends the loading state too', async () => {
        const wrapper = await mountWithImage();
        await wrapper.setProps({ src: 'https://example.com/next-600x800-delay-100.jpg' });
        await waitForEvent(wrapper, 'loading-start', 2);

        await wrapper.setProps({ src: null });
        await sleep(200);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(wrapper.vm.loading).toBe(false);
        expect(wrapper.find('.cropper-spinner').exists()).toBe(false);
    });
});

describe('refresh() and unmount', () => {
    it('does not start again after the unmount', async () => {
        const rejections = [];
        const onRejection = (reason) => rejections.push(reason);
        process.on('unhandledRejection', onRejection);
        try {
            const wrapper = await mountWithImage();

            wrapper.vm.refresh();
            wrapper.unmount();
            await sleep(50);

            expect(rejections).toEqual([]);
        } finally {
            process.off('unhandledRejection', onRejection);
        }
    });
});

describe('metadata while another image loads', () => {
    it('draws the restored crop and ends the loading state', async () => {
        const wrapper = await mountWithImage();
        const metadata = wrapper.vm.getMetadata();
        await wrapper.setProps({ src: 'https://example.com/next-600x800-delay-200.jpg' });
        await waitForEvent(wrapper, 'loading-start', 2);
        const draws = callsOf(wrapper, 'drawImage').length;

        await wrapper.setProps({ src: metadata });
        await sleep(300);

        expect(callsOf(wrapper, 'drawImage').length).toBeGreaterThan(draws);
        expect(lastDrawnImage(wrapper)[1]).toBe(metadata.img);
        expect(wrapper.vm.loading).toBe(false);
        expect(wrapper.find('.cropper-spinner').exists()).toBe(false);
    });
});

describe('remove() in the handler of a load event', () => {
    it('removes the image from initial-image-loaded', async () => {
        let wrapper;
        const onInitialImageLoaded = () => wrapper.vm.remove();
        wrapper = mountCropper({ src: landscapeUrl, onInitialImageLoaded });
        await waitForEvent(wrapper, 'initial-image-loaded');
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(callsOf(wrapper, 'drawImage')).toHaveLength(0);
    });

    it('removes the image from file-loaded', async () => {
        let wrapper;
        const onFileLoaded = () => wrapper.vm.remove();
        wrapper = await mountEmpty({ onFileLoaded });

        await chooseFile(wrapper, imageFile());
        await waitForEvent(wrapper, 'file-loaded');
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(callsOf(wrapper, 'drawImage')).toHaveLength(0);
        expect(wrapper.emitted('new-image')).toBeUndefined();
    });
});

describe('remove() in the handler of an event in the middle of a load or draw', () => {
    it('keeps a consistent state after remove() in the first draw', async () => {
        let wrapper;
        let removed = false;
        const onDraw = () => {
            if (removed) return;
            removed = true;
            wrapper.vm.remove();
        };
        wrapper = mountCropper({ src: landscapeUrl, onDraw });
        await vi.waitFor(() => expect(removed).toBe(true));
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(wrapper.vm.getMetadata().img).toBeNull();
        expect(wrapper.emitted('new-image-drawn')).toBeUndefined();
        expect(wrapper.find('.top-right-abs').exists()).toBe(false);
        // A click opens the file chooser again
        const click = vi.spyOn(wrapper.find('input[type="file"]').element, 'click');
        await wrapper.find('canvas').trigger('click');
        expect(click).toHaveBeenCalledTimes(1);
    });

    it('stops a file after remove() in file-choose', async () => {
        let wrapper;
        const onFileChoose = () => wrapper.vm.remove();
        wrapper = await mountEmpty({ onFileChoose });

        await chooseFile(wrapper, imageFile());
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(callsOf(wrapper, 'drawImage')).toHaveLength(0);
        expect(wrapper.emitted('file-loaded')).toBeUndefined();
        expect(wrapper.vm.loading).toBe(false);
    });

    it('stops a new src after remove() in image-remove-onload', async () => {
        let wrapper;
        const onImageRemoveOnload = () => wrapper.vm.remove();
        wrapper = await mountWithImage({ onImageRemoveOnload });
        const draws = callsOf(wrapper, 'drawImage').length;

        await wrapper.setProps({ src: portraitUrl });
        await waitForEvent(wrapper, 'image-remove-onload');
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(wrapper.vm.getMetadata().img).toBeNull();
        expect(callsOf(wrapper, 'drawImage')).toHaveLength(draws);
    });

    it('stops a new file after remove() in image-remove-onload', async () => {
        let wrapper;
        const onImageRemoveOnload = () => wrapper.vm.remove();
        wrapper = await mountWithImage({ onImageRemoveOnload });

        await chooseFile(wrapper, imageFile());
        await waitForEvent(wrapper, 'image-remove-onload');
        await sleep(100);

        expect(wrapper.vm.hasImage()).toBe(false);
        expect(wrapper.vm.getMetadata().img).toBeNull();
        expect(wrapper.emitted('new-image')).toBeUndefined();
    });
});

describe('remove() during a drag', () => {
    // From 1.x: the drag state stayed, so the next image followed the mouse without a button
    it('ends the drag, so the next image does not follow the mouse', async () => {
        let wrapper;
        let removed = false;
        const onMouseup = () => {
            if (removed) return;
            removed = true;
            wrapper.vm.remove();
        };
        wrapper = await mountWithImage({ onMouseup });
        const canvas = wrapper.find('canvas');

        await canvas.trigger('mousedown', { clientX: 100, clientY: 100 });
        await canvas.trigger('mouseup', { clientX: 100, clientY: 100 });
        await wrapper.setProps({ src: portraitUrl });
        await waitForEvent(wrapper, 'new-image-drawn', 2);
        const { imgData } = wrapper.vm.getMetadata();

        await canvas.trigger('mousemove', { clientX: 250, clientY: 250 });
        await sleep(50);

        expect(wrapper.vm.dragging).toBe(false);
        expect(wrapper.vm.getMetadata().imgData).toEqual(imgData);
        expect(wrapper.emitted('move')).toBeUndefined();
    });
});

describe('metadata during initial-image-loaded', () => {
    // The watchers set scaleRatio after this event, as in 1.x. The types allow null.
    it('has the image, and scaleRatio can still be null', async () => {
        let metadata;
        let wrapper;
        const onInitialImageLoaded = () => { metadata = wrapper.vm.getMetadata(); };
        wrapper = mountCropper({ src: landscapeUrl, onInitialImageLoaded });
        await waitForEvent(wrapper, 'initial-image-loaded');

        expect(metadata.img.src).toBe(landscapeUrl);
        expect(metadata.scaleRatio).toBeNull();
    });
});
