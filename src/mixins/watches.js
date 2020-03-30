import u from '../core/util';
import events from '../core/events';

export default {
    watch: {
        src: {
            handler() {
                this.$_c_setImage();
            },
            deep: true,
        },
        outputWidth() {
            this.$_c_onDimensionChange();
        },
        outputHeight() {
            this.$_c_onDimensionChange();
        },
        preventWhiteSpace(val) {
            if (val) {
                this.imageSet = false;
            }
            this.$_c_placeImage();
        },
        scaleRatio(val, oldVal) {
            if (!this.img) return;
            if (!u.numberValid(val)) return;

            let x = 1;

            if (u.numberValid(oldVal) && oldVal !== 0) {
                x = val / oldVal;
            }

            const pos = this.currentPointerCoord || {
                x: this.imgData.startX + this.imgData.width / 2,
                y: this.imgData.startY + this.imgData.height / 2,
            };

            this.imgData.width = this.naturalWidth * val;
            this.imgData.height = this.naturalHeight * val;

            if (!this.skipScaleRatio && this.imageSet) {
                const offsetX = (x - 1) * (pos.x - this.imgData.startX);
                const offsetY = (x - 1) * (pos.y - this.imgData.startY);
                this.imgData.startX -= offsetX;
                this.imgData.startY -= offsetY;
            }

            if (this.preventWhiteSpace) {
                this.$_c_preventZoomingToWhiteSpace();
                this.$_c_preventMovingToWhiteSpace();
            }
        },
        'imgData.width': function imgDataWidth(val, oldVal) {
            if (!u.numberValid(val)) return;

            this.scaleRatio = val / this.naturalWidth;

            if (this.hasImage()) {
                if (Math.abs(val - oldVal) > (val * (1 / 100000))) {
                    this.emitEvent(events.ZOOM_EVENT);
                    this.$_c_draw();
                }
            }
        },
        'imgData.height': function imgDataHeight(val) {
            if (!u.numberValid(val)) return;
            this.scaleRatio = val / this.naturalHeight;
        },
        'imgData.startX': function imgDataStartX() {
            if (this.hasImage()) {
                this.$nextTick(this.$_c_draw);
            }
        },
        'imgData.startY': function imgDataStartY() {
            if (this.hasImage()) {
                this.$nextTick(this.$_c_draw);
            }
        },
        loading(val) {
            if (val) {
                this.emitEvent(events.LOADING_START_EVENT);
            } else {
                this.emitEvent(events.LOADING_END_EVENT);
            }
        },
        dragging(bool) {
            if (!bool) this.$nextTick(this.$_c_draw);
        },
        pinching(bool) {
            if (!bool) this.$nextTick(this.$_c_draw);
        },
    },
};
