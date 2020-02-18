import poly from '../lib/polyfills';
import u from '../core/util';
import events from '../core/events';

export default {
    methods: {
        $_c_initialize() {
            this.canvas = this.$refs.canvas;
            // Hier kann ein problem entstehen, weil realwidth noch nicht existieren
            this.$_c_setSize();
            this.canvas.style.backgroundColor = this.canvasColor;
            this.ctx = this.canvas.getContext('2d');
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            this.ctx.webkitImageSmoothingEnabled = true;
            this.ctx.msImageSmoothingEnabled = true;
            this.ctx.imageSmoothingEnabled = true;
            this.img = null;
            this.$refs.fileInput.value = '';
            this.imageSet = false;
            this.chosenFile = null;
            this.$_c_setInitial();

            this.emitEvent(events.INIT_EVENT, this);
        },
        $_c_setSize() {
            this.canvas.width = this.outputWidth;
            this.canvas.height = this.outputHeight;
            this.canvas.style.width = `${this.realWidth}px`;
            this.canvas.style.height = `${this.realHeight}px`;
        },
        $_c_setInitial() {
            let src;
            let img;

            if (this.initialImage && typeof this.initialImage === 'string') {
                src = this.initialImage;
                img = new Image();

                if (!/^data:/.test(src) && !/^blob:/.test(src)) {
                    img.setAttribute('crossOrigin', 'anonymous');
                }
                img.src = src;
            } else if (typeof this.initialImage === 'object' && this.initialImage instanceof Image) {
                img = this.initialImage;
            }

            if (!src && !img) {
                this.$_c_setPlaceholders();
                return;
            }

            if (u.imageLoaded(img)) {
                this.$_c_onload(img, true);
            } else {
                this.loading = true;
                img.onload = () => {
                    this.$_c_onload(img, true);
                };
                img.onerror = () => {
                    this.$_c_setPlaceholders();
                };
            }
        },
    },
    mounted() {
        this.$_c_autoSizingInit();
        this.$_c_initialize();
        poly.rAFPolyfill();
        poly.toBlobPolyfill();

        const support = window.requestAnimationFrame && window.File && window.FileReader && window.FileList && window.Blob;

        if (typeof window === 'undefined' || !support) {
            console.warn('Your browser does not support vue-croppa functionality.');
        }
    },
    beforeDestroy() {

    },
};
