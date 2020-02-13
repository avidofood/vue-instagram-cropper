/* eslint-disable prefer-destructuring */

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

};
