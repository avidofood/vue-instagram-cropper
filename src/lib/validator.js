import { has, exists, countObject } from './helper';
/**
 * It validates the prop value for our v-model. If it's not empty, we need the URL property.
 * Remember: This is fired, when object is not empty.
 *
 * @param   {object}  val
 *
 * @return  {boolean}
 */
export default function validateVModel(val) {
    if (has(val, 'url') && countObject(val) === 1) {
        return true;
    }

    if (!has(val, 'url')) {
        emitError('v-model is missing the property url');
        return false;
    }

    if (hasCropperProperties(val)) {
        return true;
    }


    emitError('v-model is missing correct properties');

    return false;
}

function emitError(msg) {
    console.error(msg);
}

function hasCropperProperties(val) {
    let result = true;

    const firstLayer = ['url', 'thumbnail', 'order', 'image', 'cropper'];
    const secondLayer = ['img', 'imgData', 'naturalHeight', 'naturalWidth', 'outputHeight', 'outputWidth', 'scaleRatio'];
    const thirdLayer = ['height', 'startX', 'startY', 'width'];

    firstLayer.forEach((item) => {
        result = result && exists(val, item);
    });

    secondLayer.forEach((item) => {
        result = result && exists(val.cropper, item);
    });

    thirdLayer.forEach((item) => {
        result = result && exists(val.cropper.imgData, item);
    });

    return result;
}
