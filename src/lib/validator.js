import { exists } from './helper';
/**
 * It validates the prop value for our v-model. If it's not empty, we need the URL property.
 * Remember: This is fired, when object is not empty.
 *
 * @param   {object}  val
 *
 * @return  {boolean}
 */
export default function validateVModel(val) {
    if (typeof val === 'string') return true;


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

    const firstLayer = ['img', 'imgData', 'scaleRatio'];
    const secondLayer = ['height', 'startX', 'startY', 'width'];

    firstLayer.forEach((item) => {
        result = result && exists(val, item);
    });

    secondLayer.forEach((item) => {
        result = result && exists(val.imgData, item);
    });

    return result;
}
