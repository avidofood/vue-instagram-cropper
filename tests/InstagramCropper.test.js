import { createApp, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import {
    describe, expect, it, vi,
} from 'vitest';
import InstagramCropper, { Plugin } from '../src/index';
import {
    callsOf,
    chooseFile,
    contextOf,
    imageFile,
    landscapeUrl,
    lastDrawnImage,
    mountCropper,
    mountEmpty,
    mountWithImage,
    portraitUrl,
    waitForEvent,
} from './helpers';

describe('placeholder', () => {
    it('draws the placeholder text without an image', async () => {
        const wrapper = await mountEmpty({ placeholder: 'Pick a photo', placeholderColor: '#000000' });

        expect(callsOf(wrapper, 'fillText').at(-1)).toEqual(['fillText', 'Pick a photo', 300, 300]);
        expect(contextOf(wrapper).fillStyle).toBe('#000000');
        expect(wrapper.vm.hasImage()).toBe(false);
    });

    it('sizes the canvas by the container and the quality', async () => {
        const wrapper = mountCropper({ quality: 3 });
        await waitForEvent(wrapper, 'init');

        const canvas = wrapper.find('canvas').element;
        expect([canvas.width, canvas.height]).toEqual([900, 900]);
        expect([canvas.style.width, canvas.style.height]).toEqual(['300px', '300px']);
    });
});

describe('loading an image from a URL', () => {
    it('draws the image and emits the loading events', async () => {
        const wrapper = await mountWithImage();

        ['init', 'loading-start', 'initial-image-loaded', 'new-image-drawn', 'loading-end', 'draw']
            .forEach((name) => expect(wrapper.emitted(name), name).toBeTruthy());
        expect(wrapper.vm.hasImage()).toBe(true);

        const [, img, startX, startY, width, height] = lastDrawnImage(wrapper);
        expect(img.src).toBe(landscapeUrl);
        expect(img.getAttribute('crossOrigin')).toBe('anonymous');
        // An image from a URL keeps its aspect ratio: 800 x 600 fits into 600 x 600
        expect([startX, startY, width, height]).toEqual([0, 75, 600, 450]);
    });

    it('emits update with the metadata', async () => {
        const wrapper = await mountWithImage();

        const [metadata] = wrapper.emitted('update').at(-1);
        expect(metadata.img.src).toBe(landscapeUrl);
        expect(metadata.imgData).toEqual({
            width: 600, height: 450, startX: 0, startY: 75,
        });
        expect(metadata.scaleRatio).toBe(0.75);
        expect(wrapper.vm.getMetadata()).toEqual(metadata);
    });

    it('fills the canvas with preventWhiteSpace', async () => {
        const wrapper = await mountWithImage({ preventWhiteSpace: true });

        const [, , startX, startY, width, height] = lastDrawnImage(wrapper);
        expect([startX, startY, width, height]).toEqual([-100, 0, 800, 600]);
    });

    it('removes the old image when src changes', async () => {
        const wrapper = await mountWithImage();

        await wrapper.setProps({ src: portraitUrl });
        await waitForEvent(wrapper, 'new-image-drawn', 2);

        expect(wrapper.emitted('image-remove-onload')).toHaveLength(1);
        expect(lastDrawnImage(wrapper)[1].src).toBe(portraitUrl);
    });

    it('emits image-error and draws the error image when the URL fails', async () => {
        const wrapper = mountCropper({ src: 'https://example.com/broken.jpg' });
        await waitForEvent(wrapper, 'new-image-drawn');

        expect(wrapper.emitted('image-error')).toHaveLength(1);
        expect(lastDrawnImage(wrapper)[1].src).toMatch(/^data:image\/svg\+xml,/);
    });

    it('shows the placeholder when src changes to null', async () => {
        const wrapper = await mountWithImage();
        const texts = callsOf(wrapper, 'fillText').length;

        await wrapper.setProps({ src: null });
        await vi.waitFor(() => expect(wrapper.vm.hasImage()).toBe(false));

        expect(callsOf(wrapper, 'fillText').length).toBe(texts + 1);
        expect(wrapper.emitted('input').at(-1)).toEqual([null]);
    });
});

describe('loading an image from metadata', () => {
    it('restores the position and the zoom', async () => {
        const first = await mountWithImage();
        const metadata = first.vm.getMetadata();
        metadata.imgData = {
            width: 900, height: 675, startX: -150, startY: -40,
        };
        metadata.scaleRatio = 1.125;

        const wrapper = mountCropper({ src: metadata });
        await waitForEvent(wrapper, 'update');

        expect(wrapper.vm.getMetadata().imgData).toEqual(metadata.imgData);
        expect(wrapper.vm.getMetadata().scaleRatio).toBe(1.125);
        expect(wrapper.emitted('initial-image-loaded')).toHaveLength(1);
    });
});

describe('output', () => {
    it('generateDataUrl() returns the visible image', async () => {
        const wrapper = await mountWithImage();

        expect(wrapper.vm.generateDataUrl('image/jpeg', 0.8))
            .toBe('data:image/jpeg;width=600;height=450;quality=0.8');
    });

    it('generateDataUrl() returns an empty string without an image', async () => {
        const wrapper = await mountEmpty();

        expect(wrapper.vm.generateDataUrl()).toBe('');
    });

    it('generateBlob() calls back with the blob', async () => {
        const wrapper = await mountWithImage();

        const blob = await new Promise((resolve) => {
            wrapper.vm.generateBlob(resolve, 'image/jpeg', 0.5);
        });
        expect(blob.type).toBe('image/jpeg');
        expect([blob.width, blob.height, blob.quality]).toEqual([600, 450, 0.5]);
    });

    it('generateBlob() calls back with null without an image', async () => {
        const wrapper = await mountEmpty();

        const callback = vi.fn();
        wrapper.vm.generateBlob(callback);
        expect(callback).toHaveBeenCalledWith(null);
    });

    it('promisedBlob() resolves with the blob', async () => {
        const wrapper = await mountWithImage();

        const blob = await wrapper.vm.promisedBlob();
        expect(blob.type).toBe('image/png');
        expect([blob.width, blob.height]).toEqual([600, 450]);
    });

    it('saving() creates the output for other metadata', async () => {
        const wrapper = await mountWithImage();
        const { img } = wrapper.vm.getMetadata();
        const imgData = {
            width: 1200, height: 900, startX: -300, startY: -150,
        };

        const blob = await wrapper.vm
            .saving(img, imgData, wrapper.vm.outputWidth, wrapper.vm.outputHeight)
            .promisedBlob('image/webp');
        expect([blob.type, blob.width, blob.height]).toEqual(['image/webp', 600, 600]);
    });
});

describe('choosing a file', () => {
    it('loads an image file', async () => {
        const wrapper = await mountEmpty();
        const file = imageFile();

        await chooseFile(wrapper, file);
        await waitForEvent(wrapper, 'new-image-drawn');

        expect(wrapper.emitted('file-choose')[0]).toEqual([file]);
        expect(wrapper.emitted('file-loaded')).toHaveLength(1);
        expect(wrapper.emitted('new-image')).toHaveLength(1);
        expect(wrapper.vm.getChosenFile()).toBe(file);
        expect(lastDrawnImage(wrapper)[1].src).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('rejects a file over fileSizeLimit', async () => {
        const wrapper = await mountEmpty({ fileSizeLimit: 3 });
        const file = imageFile();

        await chooseFile(wrapper, file);

        expect(wrapper.emitted('file-size-exceed')[0]).toEqual([file]);
        expect(wrapper.emitted('file-loaded')).toBeUndefined();
    });

    it('rejects a file that is not an image', async () => {
        const wrapper = await mountEmpty();
        const file = new File(['text'], 'notes.txt', { type: 'text/plain' });

        await chooseFile(wrapper, file);

        expect(wrapper.emitted('file-type-mismatch')[0]).toEqual([file]);
        expect(wrapper.emitted('file-loaded')).toBeUndefined();
    });

    it('opens the file chooser on a click without an image', async () => {
        const wrapper = await mountEmpty();
        const click = vi.spyOn(wrapper.find('input[type="file"]').element, 'click');

        await wrapper.find('canvas').trigger('click');

        expect(click).toHaveBeenCalledTimes(1);
    });
});

describe('moving and zooming', () => {
    it('moves the image with the mouse', async () => {
        const wrapper = await mountWithImage();
        const canvas = wrapper.find('canvas');

        await canvas.trigger('mousedown', { clientX: 100, clientY: 100 });
        await canvas.trigger('mousemove', { clientX: 120, clientY: 90 });

        expect(wrapper.emitted('move')).toHaveLength(1);
        // quality 2: 20px with the mouse moves the image 40px on the canvas
        expect(wrapper.vm.imgData.startX).toBe(40);
        expect(wrapper.vm.imgData.startY).toBe(55);

        await canvas.trigger('mouseup', { clientX: 120, clientY: 90 });
        // The image bounces back into the canvas
        expect(wrapper.vm.imgData.startX).toBe(0);
        expect(wrapper.vm.imgData.startY).toBe(75);
    });

    it('zooms the image with the wheel', async () => {
        const wrapper = await mountWithImage();
        const { width } = wrapper.vm.imgData;

        await wrapper.find('canvas').trigger('wheel', { deltaY: -100 });
        await waitForEvent(wrapper, 'zoom');

        expect(wrapper.vm.imgData.width).toBeGreaterThan(width);
    });

    it('zoom() changes the scale ratio', async () => {
        const wrapper = await mountWithImage();

        wrapper.vm.zoom(true, 10);
        await nextTick();

        expect(wrapper.vm.scaleRatio).toBeCloseTo(0.75 * (1 + 600 * 0.00001 * 30));
    });

    it('move() moves the image', async () => {
        const wrapper = await mountWithImage();

        wrapper.vm.move({ x: -10, y: 5 });

        expect(wrapper.vm.imgData.startX).toBe(-10);
        expect(wrapper.vm.imgData.startY).toBe(80);
        expect(wrapper.emitted('move')).toHaveLength(1);
    });
});

describe('methods', () => {
    it('remove() removes the image', async () => {
        const wrapper = await mountWithImage();

        await wrapper.find('.top-right-abs').trigger('click');

        expect(wrapper.emitted('image-remove')).toHaveLength(1);
        expect(wrapper.emitted('input').at(-1)).toEqual([null]);
        expect(wrapper.vm.hasImage()).toBe(false);
        expect(wrapper.find('.top-right-abs').exists()).toBe(false);
    });

    it('the fullscreen button fills the canvas', async () => {
        const wrapper = await mountWithImage();

        await wrapper.find('.bottom-left-abs').trigger('click');
        await nextTick();

        expect(wrapper.vm.imgData).toEqual({
            width: 800, height: 600, startX: -100, startY: 0,
        });
    });

    it('returns the canvas, the context and no file', async () => {
        const wrapper = await mountWithImage();

        expect(wrapper.vm.getCanvas()).toBe(wrapper.find('canvas').element);
        expect(wrapper.vm.getContext()).toBe(contextOf(wrapper));
        expect(wrapper.vm.getChosenFile()).toBeUndefined();
    });

    it('chooseFile() opens the file chooser', async () => {
        const wrapper = await mountEmpty();
        const click = vi.spyOn(wrapper.find('input[type="file"]').element, 'click');

        wrapper.vm.chooseFile();

        expect(click).toHaveBeenCalledTimes(1);
    });

    it('refresh() loads the image again', async () => {
        const wrapper = await mountWithImage();

        wrapper.vm.refresh();
        await waitForEvent(wrapper, 'init', 2);
        await waitForEvent(wrapper, 'initial-image-loaded', 2);
        await waitForEvent(wrapper, 'new-image-drawn', 2);

        expect(wrapper.vm.hasImage()).toBe(true);
    });

    it('addClipPlugin() clips the image with preventWhiteSpace', async () => {
        const wrapper = await mountWithImage({ preventWhiteSpace: true });
        const plugin = vi.fn();

        wrapper.vm.addClipPlugin(plugin);
        wrapper.vm.move({ x: -10, y: 0 });
        await vi.waitFor(() => expect(plugin).toHaveBeenCalled());

        expect(plugin).toHaveBeenCalledWith(contextOf(wrapper), 0, 0, 600, 600);
        expect(() => wrapper.vm.addClipPlugin('circle')).toThrow('Clip plugins should be functions');
    });
});

describe('native events', () => {
    // Vue 3 also binds an undeclared listener to the root element, so it would run twice
    it('emits a drag event of the container once', async () => {
        const onDragover = vi.fn();
        const wrapper = mountCropper({ onDragover });
        await waitForEvent(wrapper, 'init');

        await wrapper.trigger('dragover');

        expect(onDragover).toHaveBeenCalledTimes(1);
    });

    it('emits a click on the canvas once', async () => {
        const onClick = vi.fn();
        const wrapper = mountCropper({ onClick });
        await waitForEvent(wrapper, 'init');

        await wrapper.find('canvas').trigger('click');

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    });
});

describe('installation', () => {
    it('the plugin registers the component', () => {
        const app = createApp({ render: () => h('div') });
        app.use(Plugin);

        expect(app.component('InstagramCropper')).toBe(InstagramCropper);
    });

    it('works as <instagram-cropper> and <InstagramCropper> in templates', () => {
        const wrapper = mount({
            template: '<div><instagram-cropper /><InstagramCropper /></div>',
        }, { global: { plugins: [Plugin] } });

        expect(wrapper.findAllComponents(InstagramCropper)).toHaveLength(2);
    });
});
