export default {
    quality: {
        type: Number,
        default: 2,
        validator(val) {
            return val > 0;
        },
    },
    canvasColor: {
        default: '#F7F7F7',
    },
    placeholder: {
        type: String,
        default: 'Choose an image',
    },
    placeholderColor: {
        default: '#67ACFD',
    },
    placeholderFontSize: {
        type: Number,
        default: 0,
        validator(val) {
            return val >= 0;
        },
    },
    fileSizeLimit: {
        type: Number,
        default: 0,
        validator(val) {
            return val >= 0;
        },
    },
    forceCacheBreak: {
        type: Boolean,
        default: false,
        note: 'This is important if you have still CORS issues. But remember the browser is not caching images anymore',
    },
    preventWhiteSpace: {
        type: Boolean,
        default: false,
    },
};
