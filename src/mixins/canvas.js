import events from '../core/events';


export default {
    methods: {
        $_c_setContainerSize() {
            this.realWidth = parseInt(getComputedStyle(this.$el).width.slice(0, -2), 10);
            this.realHeight = parseInt(getComputedStyle(this.$el).height.slice(0, -2), 10);
        },
        $_c_autoSizingInit() {
            this.$_c_setContainerSize();
            window.addEventListener('resize', this.$_c_setContainerSize);
        },
        $_c_autoSizingRemove() {
            this.$_c_setContainerSize();
            window.removeEventListener('resize', this.$_c_setContainerSize);
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
            if (!this.img) return;

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

            if (!this.imageSet) {
                this.imageSet = true;
                this.emitEvent(events.NEW_IMAGE_DRAWN_EVENT);
            }

            if (this.dragging || this.pinching || this.scrolling) {
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
            if (!this.img) {
                this.$_c_initialize();
                return;
            }

            if (this.preventWhiteSpace) {
                this.imageSet = false;
            }

            this.$_c_setSize();
            this.$_c_setCtx();

            this.$_c_placeImage();
            this.$_c_handleZoomWheel();
        },
    },
};
