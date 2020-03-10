import vModelValidator from '../lib/validator';

export default {
    src: {
        type: [Object, String],
        validator: vModelValidator,
        required: false,
    },
};
