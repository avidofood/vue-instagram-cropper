export default {
    computed: {
        outputWidth() {
            const w = this.realWidth;
            return w * this.quality;
        },
        outputHeight() {
            const h = this.realHeight;
            return h * this.quality;
        },
        computedPlaceholderFontSize() {
            return this.placeholderFontSize * this.quality;
        },
        aspectRatio() {
            return this.naturalWidth / this.naturalHeight;
        },
        maximumScaleRatio() {
            // my weird calculation from Instagram
            return this.aspectRatio * (-2.127) + 4.3405;
        },
    },
};
