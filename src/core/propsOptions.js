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
    // The CORS mode for an image from another origin. use-credentials sends the cookies.
    crossOrigin: {
        type: String,
        default: 'anonymous',
        validator(val) {
            return val === 'anonymous' || val === 'use-credentials';
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
    // false lets the page scroll over the cropper instead of zooming the image
    zoomOnWheel: {
        type: Boolean,
        default: true,
    },
    // The rule-of-thirds grid while the user moves or zooms the image
    showGrid: {
        type: Boolean,
        default: true,
    },
};
