import * as Settings from '../core/const';

export default {
    methods: {
        $_c_setPlaceholders() {
            this.$_c_paintBackground();
            this.$_c_setTextPlaceholder();
        },
        $_c_setTextPlaceholder() {
            const { ctx } = this;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';

            const defaultFontSize = (this.outputWidth * Settings.DEFAULT_PLACEHOLDER_TAKEUP) / this.placeholder.length;
            const fontSize = !this.computedPlaceholderFontSize ? defaultFontSize : this.computedPlaceholderFontSize;
            ctx.font = `${fontSize}px sans-serif`;

            ctx.fillStyle = this.placeholderColor;
            ctx.fillText(this.placeholder, this.outputWidth / 2, this.outputHeight / 2);
        },

    },

};
