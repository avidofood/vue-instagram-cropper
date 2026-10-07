import * as Settings from '../core/const';

export default {
    computed: {
        labelTexts() {
            return { ...Settings.DEFAULT_LABELS, ...this.labels };
        },
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
                const visibleHeight = this.imgData.height > this.outputHeight
                    ? this.outputHeight
                    : this.imgData.height;
                return this.outputWidth / visibleHeight;
            }

            const visibleWidth = this.imgData.width > this.outputWidth
                ? this.outputWidth
                : this.imgData.width;
            return visibleWidth / this.outputHeight;
        },
        // With preventWhiteSpace, the image must fill the canvas
        minimumScaleRatio() {
            if (!this.preventWhiteSpace) return 0;

            return Math.max(
                this.outputWidth / this.naturalWidth,
                this.outputHeight / this.naturalHeight,
            );
        },
        maximumScaleRatio() {
            // my weird calculation from Instagram
            const maximum = this.aspectRatio * (2.56) + 2.725;
            // For a narrow image, the fill size can be larger than this maximum
            return Math.max(maximum, this.minimumScaleRatio);
        },
        maximumAspectRatio() {
            return this.canvasRatio > Settings.MAXIMUM_ASPECT_RATIO
                ? this.canvasRatio
                : Settings.MAXIMUM_ASPECT_RATIO;
        },
        minimumAspectRatio() {
            return this.canvasRatio < Settings.MINIMUM_ASPECT_RATIO
                ? this.canvasRatio
                : Settings.MINIMUM_ASPECT_RATIO;
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
