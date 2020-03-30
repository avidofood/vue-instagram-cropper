export default {
    methods: {
        $_c_clipPathFactory(x, y, width, height) {
            const { ctx } = this;
            const radius = 0;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        },
        $_c_createContainerClipPath() {
            this.$_c_clipPathFactory(0, 0, this.outputWidth, this.outputHeight);
            if (this.clipPlugins && this.clipPlugins.length) {
                this.clipPlugins.forEach((func) => {
                    func(this.ctx, 0, 0, this.outputWidth, this.outputHeight);
                });
            }
        },
        $_c_clip(createPath) {
            const { ctx } = this;
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.globalCompositeOperation = 'destination-in';
            createPath();
            ctx.fill();
            ctx.restore();
        },
    },
};
