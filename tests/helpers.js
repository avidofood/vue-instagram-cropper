import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import InstagramCropper from '../src/index';

// 800 x 600 pixels, see tests/setup.js
export const landscapeUrl = 'https://example.com/photo-800x600.jpg';
export const portraitUrl = 'https://example.com/photo-600x800.jpg';

// The container is 300 x 300 pixels. With the default quality of 2 the canvas is 600 x 600.
export const mountCropper = (props = {}, options = {}) => mount(InstagramCropper, {
    props,
    attrs: { style: 'width: 300px; height: 300px;' },
    attachTo: document.body,
    ...options,
});

export const contextOf = (wrapper) => wrapper.find('canvas').element.getContext('2d');

export const callsOf = (wrapper, name) => contextOf(wrapper).calls
    .filter((call) => call[0] === name);

export const lastDrawnImage = (wrapper) => callsOf(wrapper, 'drawImage').at(-1);

export const waitForEvent = (wrapper, name, count = 1) => vi.waitFor(() => {
    const emitted = wrapper.emitted(name) || [];
    if (emitted.length < count) throw new Error(`${name} was emitted ${emitted.length} times`);
});

// Waits until the component drew the placeholder. The first image loads 30ms after the mount.
export const mountEmpty = async (props = {}, options = {}) => {
    const wrapper = mountCropper(props, options);
    await vi.waitFor(() => {
        if (!callsOf(wrapper, 'fillText').length) throw new Error('No placeholder yet');
    });
    return wrapper;
};

// Waits until the component drew an image and emitted update with the metadata
export const mountWithImage = async (props = {}, options = {}) => {
    const wrapper = mountCropper({ src: landscapeUrl, ...props }, options);
    await waitForEvent(wrapper, 'update');
    return wrapper;
};

// Sets the file on the hidden file input, as the file chooser of the browser does
export const chooseFile = async (wrapper, file) => {
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');
};

export const imageFile = (name = 'photo.jpg', bytes = [0xFF, 0xD8, 0xFF, 0xD9]) => new File(
    [new Uint8Array(bytes)],
    name,
    { type: 'image/jpeg' },
);
