import * as Settings from '../core/const';

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
        // The ratio you see on the canvas or blob result
        aspectCanvasRatio() {
            if (this.$_c_imageIsWiderThanHeight()) {
                return this.outputWidth / (this.imgData.height > this.outputHeight ? this.outputHeight : this.imgData.height);
            }

            return (this.imgData.width > this.outputWidth ? this.outputWidth : this.imgData.width) / this.outputHeight;
        },
        maximumScaleRatio() {
            // my weird calculation from Instagram
            return this.aspectRatio * (-2.127) + 4.3405;
        },
        greaterThanMaximumAspectRatio() {
            return this.aspectRatio > Settings.MAXIMUM_ASPECT_RATIO;
        },
        smallerThanMinimumAspectRatio() {
            return this.aspectRatio < Settings.MINIMUM_ASPECT_RATIO;
        },
        greaterThanMaximumAspectCanvasRatio() {
            return this.aspectCanvasRatio > Settings.MAXIMUM_ASPECT_RATIO;
        },
        smallerThanMinimumAspectCanvasRatio() {
            return this.aspectCanvasRatio < Settings.MINIMUM_ASPECT_RATIO;
        },

    },
};
