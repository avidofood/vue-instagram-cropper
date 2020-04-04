import u from '../core/util';
import events from '../core/events';
import debounce from '../lib/debounce';
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
            let img = new Image();
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
                this.$_c_onload(img, +img.dataset.exifOrientation, initial, true);
            } else {
                this.loading = true;
                this.$_c_paintBackground();
                img.onload = () => {
                    this.$_c_onload(img, +img.dataset.exifOrientation, initial, true);
                };
                img.onerror = () => {
                    this.emitEvent(events.IMAGE_ERROR_EVENT);
                    img = new Image();
                    img.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 600 600\'%3E%3Cpath fill=\'%23fff\' d=\'M0 0H600V600H0z\'/%3E%3Cpath d=\'M231.17 366.43a15.88 15.88 0 0 1-15.88-15.88v-95.31a15.88 15.88 0 0 1 15.88-15.88h137.66a15.89 15.89 0 0 1 15.89 15.88v95.31a15.89 15.89 0 0 1-15.89 15.88zm2.65-90a18.53 18.53 0 1 0 18.53-18.53 18.52 18.52 0 0 0-18.53 18.52zm129.72 68.83v-37.07l-29-29a4 4 0 0 0-5.62 0l-44.84 44.84-18.33-18.33a4 4 0 0 0-5.62 0l-23.67 23.67v15.88z\' fill=\'%23252525\'/%3E%3Cpath d=\'M169.39 219.53a6.66 6.66 0 0 1-1.17-9.34l8.18-10.52a6.66 6.66 0 0 1 9.35-1.17l244.86 189.25a6.68 6.68 0 0 1 1.17 9.35l-8.18 10.51a6.66 6.66 0 0 1-9.35 1.17z\' fill=\'%23b1605f\'/%3E%3C/svg%3E';
                    img.onload = () => {
                        this.$_c_onload(img, +img.dataset.exifOrientation, initial, true);
                    };
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
        $_c_onload(img, orientation = 1, initial, keepAspect = false) {
            if (this.imageSet) {
                this.remove(events.IMAGE_REMOVE_ONLOAD_EVENT);
            }

            this.img = img;


            if (orientation > 1) {
                if (!this.img) return;

                const tempImg = u.getRotatedImage(this.img, orientation);

                tempImg.onload = () => {
                    this.img = tempImg;
                    this.$_c_placeImage(keepAspect);
                };
            } else {
                this.$_c_placeImage(keepAspect);
            }

            if (initial) {
                this.emitEvent(events.INITIAL_IMAGE_LOADED_EVENT);
            }
        },
        $_c_placeImage(keepAspect) {
            if (!this.img) return;

            const { imgData } = this;
            this.naturalWidth = this.img.naturalWidth;
            this.naturalHeight = this.img.naturalHeight;
            imgData.startX = u.numberValid(imgData.startX) ? imgData.startX : 0;
            imgData.startY = u.numberValid(imgData.startY) ? imgData.startY : 0;

            if (this.preventWhiteSpace) {
                this.$_c_aspectFill();
            } else if (!this.imageSet) {
                // This part is important, when you load your own images from your server.
                // Usually the aspectRatio is perfectly set and you don't want to change it.
                // For example if you are loading the image via URL src
                // and you don't want to change the aspect ratio
                if (keepAspect && !this.greaterThanMaximumAspectRatio && !this.smallerThanMinimumAspectRatio) {
                    this.$_c_aspectFit();
                } else {
                    this.$_c_aspectFill();
                }
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
            let scaleRatio;

            this.skipScaleRatio = true;

            // image is wider than canvas
            if (this.aspectRatio > this.canvasRatio) {
                if (this.greaterThanMaximumAspectRatio) {
                    this.imgData.height = this.outputWidth / this.maximumAspectRatio;
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
                this.imgData.width = this.outputHeight * this.minimumAspectRatio;
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
            let scaleRatio;

            this.skipScaleRatio = true;

            if (this.aspectRatio > this.canvasRatio) {
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
        /**
         * That means the image is smaller than the canvas
         */
        $_c_imageIsFullyZoomedOut() {
            if (this.aspectRatio > this.canvasRatio) {
                return this.imgData.width < this.outputWidth
                    || this.greaterThanMaximumAspectCanvasRatio;
            }

            return this.imgData.height < this.outputHeight
                || this.smallerThanMinimumAspectCanvasRatio;
        },
        /**
         * That means the image that the image is much more zoomed in.
         * Like fully covered or even more zoomed in.
         */
        $_c_imageIsFullyZoomedIn() {
            if (this.aspectRatio > this.canvasRatio) {
                return this.imgData.height >= this.outputHeight;
            }

            return this.imgData.width >= this.outputWidth;
        },
        $_c_imageReachedMaximumScale() {
            return this.scaleRatio >= this.maximumScaleRatio;
        },
        $_c_updateVModel: debounce(function updateVModel() {
            this.$emit('update', this.getMetadata());
        }, 20),

    },
};
