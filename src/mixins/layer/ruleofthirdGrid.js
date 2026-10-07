import * as Settings from '../../core/const';

/**
 * Adds a rule of third grid
 */
export default {
    beforeUnmount() {
        clearTimeout(this.$_c_gridTimer);
    },
    methods: {
        // Shows the grid now and hides it when the user stops zooming or pressing keys
        $_c_showGridBriefly() {
            this.adjusting = true;
            clearTimeout(this.$_c_gridTimer);
            this.$_c_gridTimer = setTimeout(() => {
                this.adjusting = false;
                this.$_c_draw(true);
            }, Settings.GRID_DURATION);
        },
        // A new load ends the grid without a redraw. The new image draws without a grid.
        $_c_stopGrid() {
            clearTimeout(this.$_c_gridTimer);
            this.adjusting = false;
        },
        $_c_drawRuleOfThirdGrid() {
            const wi = this.$_c_ROTWidth();
            const hi = this.$_c_ROTHeight();

            this.$_c_drawROTFromTopToDown(wi, hi);
            this.$_c_drawROTFromLeftToRight(wi, hi);
        },
        $_c_ROTWidth() {
            if (this.imgData.startX >= 0) {
                if (this.outputWidth < this.imgData.startX + this.imgData.width) {
                    return this.outputWidth - this.imgData.startX;
                }
                return this.imgData.width;
            } if (this.outputWidth < this.imgData.startX + this.imgData.width) {
                return this.outputWidth;
            }
            return this.imgData.startX + this.imgData.width;
        },
        $_c_ROTHeight() {
            if (this.imgData.startY >= 0) {
                if (this.outputHeight < this.imgData.startY + this.imgData.height) {
                    return this.outputHeight - this.imgData.startY;
                }
                return this.imgData.height;
            } if (this.outputHeight < this.imgData.startY + this.imgData.height) {
                return this.outputHeight;
            }
            return this.imgData.startY + this.imgData.height;
        },
        $_c_drawROTFromTopToDown(wi, hi) {
            const x0 = this.imgData.startX < 0 ? 0 : this.imgData.startX;
            const y0 = this.imgData.startY < 0 ? 0 : this.imgData.startY;

            const deltaX = wi / 3;

            this.line.x1 = x0 + deltaX;
            this.line.y1 = y0;
            this.line.x2 = this.line.x1;
            this.line.y2 = y0 + hi;

            this.line.draw();

            this.line.x1 = x0 + 2 * deltaX;
            this.line.y1 = y0;
            this.line.x2 = this.line.x1;
            this.line.y2 = y0 + hi;

            this.line.draw();
        },
        $_c_drawROTFromLeftToRight(wi, hi) {
            const x0 = this.imgData.startX < 0 ? 0 : this.imgData.startX;
            const y0 = this.imgData.startY < 0 ? 0 : this.imgData.startY;

            const deltaY = hi / 3;

            this.line.x1 = x0;
            this.line.y1 = y0 + deltaY;
            this.line.x2 = x0 + wi;
            this.line.y2 = this.line.y1;

            this.line.draw();

            this.line.x1 = x0;
            this.line.y1 = y0 + 2 * deltaY;
            this.line.x2 = x0 + wi;
            this.line.y2 = this.line.y1;

            this.line.draw();
        },
    },
};
