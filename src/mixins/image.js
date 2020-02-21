import u from '../core/util';
import events from '../core/events';
import { has, countObject } from '../lib/helper';
import debounce from '../lib/debounce';

export default {
    methods: {
        $_c_setImage: debounce(function setImage() {
            if (countObject(this.value) === 1 && has(this.value, 'url') && typeof this.value.url === 'string') {
                this.$_c_setImageViaUrl();
                return;
            }
            // Due to the validator of value, we can assume the properties are correct
            if (this.value && typeof this.value === 'object') {
                this.$_c_setImageViaObject();
                return;
            }

            this.$_c_setPlaceholders();
        }, 50),
        $_c_setImageViaUrl() {
            const img = new Image();

            if (!/^data:/.test(this.value.url) && !/^blob:/.test(this.value.url)) {
                img.setAttribute('crossOrigin', 'anonymous');
            }
            img.src = this.value.url;


            if (u.imageLoaded(img)) {
                this.$_c_onload(img, +img.dataset.exifOrientation, true);
            } else {
                this.loading = true;
                img.onload = () => {
                    this.$_c_onload(img, +img.dataset.exifOrientation, true);
                };
                img.onerror = () => {
                    this.$_c_setPlaceholders();
                };
            }
        },
        $_c_setImageViaObject() {
            const { img } = this.value.cropper;
            const { ctx } = this;

            this.naturalHeight = img.naturalHeight;
            this.naturalWidth = img.naturalWidth;

            this.imageSet = true;
            this.skipScaleRatio = true;

            this.img = img;
            this.imgData = this.value.cropper.imgData;

            // Needed to trick the $Watcher with OldVal out.
            this.$nextTick(() => {
                this.imgData = this.value.cropper.imgData;
                this.scaleRatio = this.value.cropper.scaleRatio;
                this.skipScaleRatio = false;
            });

            this.scaleRatio = this.value.cropper.scaleRatio;

            const {
                startX, startY, width, height,
            } = this.value.cropper.imgData;

            console.log(this.value);
            ctx.drawImage(this.img, startX, startY, width, height);
        },
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
        $_c_updateVModel: debounce(function updateVModel() {
            this.$emit('input', {
                url: has(this.value, 'url') ? this.value.url : '',
                cropper: {
                    img: this.img,
                    imgData: this.imgData,
                    scaleRatio: this.scaleRatio,
                },
            });
        }, 20),

    },
};
