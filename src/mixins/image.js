import u from '../core/util';
import events from '../core/events';

export default {
    methods: {
        $_c_onload(img, orientation = 1, initial) {
            if (this.imageSet) {
                this.remove();
            }

            this.img = img;


            if (orientation > 1) {
                if (!this.img) return;

                const tempImg = u.getRotatedImage(this.img, orientation);

                tempImg.onload = () => {
                    this.img = tempImg;
                    this.$_c_placeImage();
                };
            } else {
                this.$_c_placeImage();
            }

            if (initial) {
                this.emitEvent(events.INITIAL_IMAGE_LOADED_EVENT);
            }
        },
        $_c_placeImage() {
            if (!this.img) return;

            const { imgData } = this;
            this.naturalWidth = this.img.naturalWidth;
            this.naturalHeight = this.img.naturalHeight;
            imgData.startX = u.numberValid(imgData.startX) ? imgData.startX : 0;
            imgData.startY = u.numberValid(imgData.startY) ? imgData.startY : 0;


            if (!this.imageSet) {
                this.$_c_aspectFit();
            } else {
                this.imgData.width = this.naturalWidth * this.scaleRatio;
                this.imgData.height = this.naturalHeight * this.scaleRatio;
            }

            this.move({ x: 0, y: 0 });
            this.$_c_draw();
        },
        $_c_aspectFit() {
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;
            const canvasRatio = this.outputWidth / this.outputHeight;
            let scaleRatio;

            this.skipScaleRatio = true;

            if (this.aspectRatio > canvasRatio) {
                scaleRatio = imgWidth / this.outputWidth;
                this.imgData.height = imgHeight / scaleRatio;
                this.imgData.width = this.outputWidth;
                this.$_c_bounceTopCenter();
                this.$_c_bounceLeft();
            } else {
                scaleRatio = imgHeight / this.outputHeight;
                this.imgData.width = imgWidth / scaleRatio;
                this.imgData.height = this.outputHeight;
                this.$_c_bounceLeftCenter();
                this.$_c_bounceTop();
            }

            this.$nextTick(() => {
                this.skipScaleRatio = false;
            });
        },
        /**
         * Is like "cover". Fills ups the whole canvas
         */
        $_c_aspectFill() {
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;
            const canvasRatio = this.outputWidth / this.outputHeight;
            let scaleRatio;

            this.skipScaleRatio = true;

            if (this.aspectRatio > canvasRatio) {
                scaleRatio = imgHeight / this.outputHeight;
                this.imgData.width = imgWidth / scaleRatio;
                this.imgData.height = this.outputHeight;
                this.$_c_bounceLeftCenter();
                this.$_c_bounceTop();
            } else {
                scaleRatio = imgWidth / this.outputWidth;
                this.imgData.height = imgHeight / scaleRatio;
                this.imgData.width = this.outputWidth;
                this.$_c_bounceTopCenter();
                this.$_c_bounceLeft();
            }

            this.$nextTick(() => {
                this.skipScaleRatio = false;
            });
        },
        $_c_imageIsFullyZoomedOut() {
            if (this.$_c_imageIsWiderThanHeight()) {
                return this.imgData.width <= this.outputWidth;
            }

            return this.imgData.height <= this.outputHeight;
        },
        $_c_imageIsFullyZoomedIn() {
            // Like cover or even more zoomed in.
            if (this.$_c_imageIsWiderThanHeight()) {
                return this.imgData.height >= this.outputHeight;
            }

            return this.imgData.width >= this.outputWidth;
        },
        $_c_imageIsWiderThanHeight() {
            return this.imgData.width > this.imgData.height;
        },
        $_c_imageReachedMaximumScale() {
            return this.scaleRatio >= this.maximumScaleRatio;
        },

    },
};
