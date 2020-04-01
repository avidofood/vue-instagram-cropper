/**
 * Bounces the image back, if it is not dislayed correctly when moved
 */
export default {
    methods: {
        $_c_checkBounceness() {
            if (this.aspectRatio > this.canvasRatio) {
                // Checking Y-Coordination
                if (this.imgData.height <= this.outputHeight) {
                    this.$_c_bounceTopCenter();
                } else if (this.imgData.startY >= 0) {
                    this.$_c_bounceTop();
                } else {
                    const visibleHeight = this.imgData.height + this.imgData.startY;

                    if (visibleHeight < this.outputHeight) {
                        this.$_c_bounceBottom();
                    }
                }

                // Checking X-Coordination
                if (this.imgData.startX >= 0) {
                    this.$_c_bounceLeft();
                } else {
                    const visibleWidth = this.imgData.width + this.imgData.startX;

                    if (visibleWidth < this.outputWidth) {
                        this.$_c_bounceRight();
                    }
                }
            } else {
                // Checking X-Coordination
                if (this.imgData.width <= this.outputWidth) {
                    this.$_c_bounceLeftCenter();
                } else if (this.imgData.startX >= 0) {
                    this.$_c_bounceLeft();
                } else {
                    const visibleWidth = this.imgData.width + this.imgData.startX;

                    if (visibleWidth < this.outputWidth) {
                        this.$_c_bounceRight();
                    }
                }

                // Checking Y-Coordination
                if (this.imgData.startY >= 0) {
                    this.$_c_bounceTop();
                } else {
                    const visibleHeight = this.imgData.height + this.imgData.startY;

                    if (visibleHeight < this.outputHeight) {
                        this.$_c_bounceBottom();
                    }
                }
            }
        },
        $_c_bounceLeft() {
            this.imgData.startX = 0;
        },
        $_c_bounceTop() {
            this.imgData.startY = 0;
        },
        $_c_bounceRight() {
            this.imgData.startX = this.outputWidth - this.imgData.width;
        },
        $_c_bounceBottom() {
            this.imgData.startY = this.outputHeight - this.imgData.height;
        },
        $_c_bounceTopCenter() {
            this.imgData.startY = -(this.imgData.height - this.outputHeight) / 2;
        },
        $_c_bounceLeftCenter() {
            this.imgData.startX = -(this.imgData.width - this.outputWidth) / 2;
        },
    },
};
