import events from '../core/events';

// A hidden container, for example with v-show, has no size in pixels. The browser then
// reports a value such as 100% or auto.
const pixels = (value) => (/^\d+(\.\d+)?px$/.test(value) ? parseInt(value, 10) : 0);

export default {
    methods: {
        $_c_setContainerSize() {
            const style = getComputedStyle(this.$el);
            this.realWidth = pixels(style.width);
            this.realHeight = pixels(style.height);
        },
        $_c_autoSizingInit() {
            this.$_c_setContainerSize();
            // Without ResizeObserver, for example in jsdom, the size stays as it was at the mount
            if (typeof ResizeObserver === 'undefined') return;
            this.$_c_resizeObserver = new ResizeObserver(() => this.$_c_setContainerSize());
            this.$_c_resizeObserver.observe(this.$el);
        },
        $_c_autoSizingRemove() {
            if (this.$_c_resizeObserver) this.$_c_resizeObserver.disconnect();
        },
        $_c_draw() {
            this.$nextTick(() => {
                if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                    requestAnimationFrame(this.$_c_drawFrame);
                } else {
                    this.$_c_drawFrame();
                }
            });
        },
        $_c_drawFrame() {
            if (!this.img || this.$.isUnmounted) return;
            // A container without a size, for example with v-show. $_c_onDimensionChange()
            // places and draws the image when the container gets a size.
            if (!this.outputWidth || !this.outputHeight) return;

            // A handler of draw or new-image-drawn can call remove()
            const { img } = this;
            this.loading = false;
            const { ctx } = this;
            const {
                startX, startY, width, height,
            } = this.imgData;

            this.$_c_paintBackground();
            ctx.drawImage(this.img, startX, startY, width, height);

            if (this.preventWhiteSpace) {
                this.$_c_clip(this.$_c_createContainerClipPath);
            }

            this.emitEvent(events.DRAW_EVENT, ctx);
            if (this.img !== img) return;

            if (!this.imageSet) {
                this.imageSet = true;
                this.emitEvent(events.NEW_IMAGE_DRAWN_EVENT);
                if (this.img !== img) return;
            }

            if (this.showGrid && (this.dragging || this.pinching || this.adjusting)) {
                this.$_c_drawRuleOfThirdGrid();
            }

            this.$_c_updateVModel();
        },
        $_c_paintBackground() {
            this.ctx.fillStyle = this.canvasColor;
            this.ctx.clearRect(0, 0, this.outputWidth, this.outputHeight);
            this.ctx.fillRect(0, 0, this.outputWidth, this.outputHeight);
        },
        $_c_onDimensionChange() {
            this.$_c_setSize();
            this.$_c_setCtx();

            if (!this.img) {
                // An image that still loads is placed when it arrives
                if (!this.loading) this.$_c_setPlaceholders();
                return;
            }

            if (this.preventWhiteSpace) {
                this.imageSet = false;
            }

            // An image that loaded while the container had no size was never drawn, so
            // imageSet is false and the image gets its first placement here
            this.$_c_placeImage(this.$_c_keepAspect);
            this.$_c_handleZoomWheel();
        },
    },
};
