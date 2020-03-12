import poly from '../lib/polyfills';
import events from '../core/events';
import Line from '../lib/Line';

export default {
    methods: {
        $_c_initialize() {
            this.canvas = this.$refs.canvas;
            this.$_c_setSize();
            this.canvas.style.backgroundColor = this.canvasColor;
            this.ctx = this.canvas.getContext('2d');
            this.$_c_setCtx();
            this.line = new Line(this.ctx);
            this.img = null;
            this.$refs.fileInput.value = '';
            this.imageSet = false;
            this.chosenFile = null;
            this.$_c_setImage(true);

            this.emitEvent(events.INIT_EVENT, this);
        },
        $_c_setSize() {
            this.canvas.width = this.outputWidth;
            this.canvas.height = this.outputHeight;
            this.canvas.style.width = `${this.realWidth}px`;
            this.canvas.style.height = `${this.realHeight}px`;
        },
        $_c_setCtx() {
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
            this.ctx.webkitImageSmoothingEnabled = true;
            this.ctx.msImageSmoothingEnabled = true;
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.strokeStyle = '#ffffff';
        },
        $_c_reset_values() {
            this.img = null;
            this.$refs.fileInput.value = '';
            this.imgData = {
                width: 0,
                height: 0,
                startX: 0,
                startY: 0,
            };
            this.orientation = 1;
            this.scaleRatio = null;
            this.imageSet = false;
            this.chosenFile = null;

            this.$emit('input', null);
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
        this.$_c_autoSizingRemove();
    },
};
