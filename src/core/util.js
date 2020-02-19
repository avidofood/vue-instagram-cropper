/* eslint-disable prefer-destructuring */

import CanvasExifOrientation from 'canvas-exif-orientation';

export default {
    imageLoaded(img) {
        return img.complete && img.naturalWidth !== 0;
    },
    numberValid(n) {
        return typeof n === 'number' && !Number.isNaN(n);
    },
    getPointerCoords(evt, vm) {
        let pointer;
        if (evt.touches && evt.touches[0]) {
            pointer = evt.touches[0];
        } else if (evt.changedTouches && evt.changedTouches[0]) {
            pointer = evt.changedTouches[0];
        } else {
            pointer = evt;
        }
        return this.onePointCoord(pointer, vm);
    },
    onePointCoord(point, vm) {
        const { canvas, quality } = vm;
        const rect = canvas.getBoundingClientRect();
        const { clientX } = point;
        const { clientY } = point;
        return {
            x: (clientX - rect.left) * quality,
            y: (clientY - rect.top) * quality,
        };
    },
    getPinchDistance(evt, vm) {
        const pointer1 = evt.touches[0];
        const pointer2 = evt.touches[1];
        const coord1 = this.onePointCoord(pointer1, vm);
        const coord2 = this.onePointCoord(pointer2, vm);

        return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
    },
    eventHasFile(evt) {
        const dt = evt.dataTransfer || evt.originalEvent.dataTransfer;
        if (dt.types) {
            for (let i = 0, len = dt.types.length; i < len; i += 1) {
                if (dt.types[i] === 'Files') {
                    return true;
                }
            }
        }

        return false;
    },
    getRotatedImage(img, orientation) {
        const canvas = CanvasExifOrientation.drawImage(img, orientation);
        const tempImg = new Image();
        tempImg.src = canvas.toDataURL();
        return tempImg;
    },
    getFileOrientation(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        if (view.getUint16(0, false) !== 0xFFD8) return -2;
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
            const marker = view.getUint16(offset, false);
            offset += 2;
            if (marker === 0xFFE1) {
                if (view.getUint32(offset += 2, false) !== 0x45786966) return -1;
                const little = view.getUint16(offset += 6, false) === 0x4949;
                offset += view.getUint32(offset + 4, little);
                const tags = view.getUint16(offset, little);
                offset += 2;
                for (let i = 0; i < tags; i += 1) {
                    if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                        return view.getUint16(offset + (i * 12) + 8, little);
                    }
                }
            } else if ((marker & 0xFF00) !== 0xFF00) break;
            else offset += view.getUint16(offset, false);
        }
        return -1;
    },
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },
    parseDataUrl(url) {
        const reg = /^data:([^;]+)?(;base64)?,(.*)/gmi;
        return reg.exec(url)[3];
    },


};
