import u from '../core/util';
import events from '../core/events';

export default {
    methods: {
        $_c_onload(img, initial) {
            if (this.imageSet) {
                this.remove();
            }

            this.img = img;

            this.$_c_placeImage();

            if (initial) {
                this.emitEvent(events.INITIAL_IMAGE_LOADED_EVENT);
            }
        },
        $_c_placeImage(applyMetadata) {
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

            if (applyMetadata) {
                this.$_c_applyMetadata();
            }

            this.move({ x: 0, y: 0 });
            this.$_c_draw();
        },
        $_c_aspectFit() {
            const imgWidth = this.naturalWidth;
            const imgHeight = this.naturalHeight;
            const canvasRatio = this.outputWidth / this.outputHeight;
            let scaleRatio;
            if (this.aspectRatio > canvasRatio) {
                scaleRatio = imgWidth / this.outputWidth;
                this.imgData.height = imgHeight / scaleRatio;
                this.imgData.width = this.outputWidth;
                this.imgData.startY = -(this.imgData.height - this.outputHeight) / 2;
                this.imgData.startX = 0;
            } else {
                scaleRatio = imgHeight / this.outputHeight;
                this.imgData.width = imgWidth / scaleRatio;
                this.imgData.height = this.outputHeight;
                this.imgData.startX = -(this.imgData.width - this.outputWidth) / 2;
                this.imgData.startY = 0;
            }
        },
        $_c_applyMetadata() {
            if (!this.userMetadata) return;

            const { startX, startY, scale } = this.userMetadata;
            if (u.numberValid(startX)) {
                this.imgData.startX = startX;
            }
            if (u.numberValid(startY)) {
                this.imgData.startY = startY;
            }
            if (u.numberValid(scale)) {
                this.scaleRatio = scale;
            }
            this.$nextTick(() => {
                this.userMetadata = null;
            });
        },

    },
};
