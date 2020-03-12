import u from '../core/util';
import events from '../core/events';
import debounce from '../lib/debounce';
import * as Settings from '../core/const';
import deepClone from '../lib/deepClone';

export default {
    methods: {
        /**
         * Set's image via the src-prop.
         * Image can be an URL or an object.
         * We need to debounce, so that the next image
         * is rendered correctly
         */
        $_c_setImage: debounce(function setImage(inital = false) {
            if (typeof this.src === 'string') {
                this.$_c_setImageViaUrl(inital);
                return;
            }
            // Due to the validator of value, we can assume the properties are correct
            if (this.src && typeof this.src === 'object') {
                this.$_c_setImageViaObject(inital);
                return;
            }

            this.$_c_setPlaceholders();
            this.$_c_reset_values();
        }, 30),
        $_c_setImageViaUrl(initial) {
            const img = new Image();
            let href = this.src;

            if (!/^data:/.test(href) && !/^blob:/.test(href)) {
                img.setAttribute('crossOrigin', 'anonymous');
            }

            if (this.forceCacheBreak) {
                const src = new URL(this.src);
                src.searchParams.append('cors', Date.now());
                href = src.href;
            }

            img.src = href;


            if (u.imageLoaded(img)) {
                this.$_c_onload(img, +img.dataset.exifOrientation, initial);
            } else {
                this.loading = true;
                this.$_c_paintBackground();
                img.onload = () => {
                    this.$_c_onload(img, +img.dataset.exifOrientation, initial);
                };
                img.onerror = () => {
                    this.$_c_setPlaceholders();
                };
            }
        },
        $_c_setImageViaObject(initial) {
            const src = deepClone(this.src);

            // can't be cloned
            const { img } = this.src;

            this.naturalHeight = img.naturalHeight;
            this.naturalWidth = img.naturalWidth;

            this.imageSet = true;
            this.skipScaleRatio = true;

            this.img = img;
            this.imgData = src.imgData;

            // Needed to trick the $Watcher with OldVal out.
            this.$nextTick(() => {
                this.imgData = src.imgData;
                this.scaleRatio = src.scaleRatio;
                this.skipScaleRatio = false;

                this.$_c_checkBounceness();

                if (initial) {
                    this.emitEvent(events.INITIAL_IMAGE_LOADED_EVENT);
                }
            });

            this.scaleRatio = src.scaleRatio;
        },
        $_c_onload(img, orientation = 1, initial) {
            if (this.imageSet) {
                this.remove(events.IMAGE_REMOVE_ONLOAD_EVENT);
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
                this.$_c_aspectFill();
            } else {
                // Called in $_c_onDimensionChange
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

            // image is wider than canvas
            if (this.aspectRatio > canvasRatio) {
                if (this.greaterThanMaximumAspectRatio) {
                    this.imgData.height = this.outputWidth / Settings.MAXIMUM_ASPECT_RATIO;
                    this.imgData.width = (this.imgData.height / imgHeight) * imgWidth;
                    this.$_c_bounceTopCenter();
                    this.$_c_bounceLeftCenter();
                } else {
                    scaleRatio = imgWidth / this.outputWidth;
                    this.imgData.height = imgHeight / scaleRatio;
                    this.imgData.width = this.outputWidth;
                    this.$_c_bounceTopCenter();
                    this.$_c_bounceLeft();
                }
            } else if (this.smallerThanMinimumAspectRatio) {
                this.imgData.width = this.outputHeight * Settings.MINIMUM_ASPECT_RATIO;
                this.imgData.height = (this.imgData.width / imgWidth) * imgHeight;
                this.$_c_bounceTopCenter();
                this.$_c_bounceLeftCenter();
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
                return this.imgData.width <= this.outputWidth
                    || this.greaterThanMaximumAspectCanvasRatio;
            }

            return this.imgData.height <= this.outputHeight
                || this.smallerThanMinimumAspectCanvasRatio;
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
            this.$emit('update', this.getMetadata());
        }, 20),

    },
};
