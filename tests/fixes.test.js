import { describe, expect, it } from 'vitest';
import {
    chooseFile,
    imageFile,
    lastDrawnImage,
    mountEmpty,
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
