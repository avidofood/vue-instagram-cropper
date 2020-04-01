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
        canvasRatio() {
            return this.outputWidth / this.outputHeight;
        },
        // The ratio you see on the canvas or blob result
        aspectCanvasRatio() {
            if (this.aspectRatio > this.canvasRatio) {
                return this.outputWidth / (this.imgData.height > this.outputHeight ? this.outputHeight : this.imgData.height);
            }

            return (this.imgData.width > this.outputWidth ? this.outputWidth : this.imgData.width) / this.outputHeight;
        },
        maximumScaleRatio() {
            // my weird calculation from Instagram
            return this.aspectRatio * (2.56) + 2.725;
        },
        maximumAspectRatio() {
            return this.canvasRatio > Settings.MAXIMUM_ASPECT_RATIO ? this.canvasRatio : Settings.MAXIMUM_ASPECT_RATIO;
        },
        minimumAspectRatio() {
            return this.canvasRatio < Settings.MINIMUM_ASPECT_RATIO ? this.canvasRatio : Settings.MINIMUM_ASPECT_RATIO;
        },
        greaterThanMaximumAspectRatio() {
            return this.aspectRatio > this.maximumAspectRatio;
        },
        smallerThanMinimumAspectRatio() {
            return this.aspectRatio < this.minimumAspectRatio;
        },
        greaterThanMaximumAspectCanvasRatio() {
            return this.aspectCanvasRatio > this.maximumAspectRatio;
        },
        smallerThanMinimumAspectCanvasRatio() {
            return this.aspectCanvasRatio < this.minimumAspectRatio;
        },

    },
};
