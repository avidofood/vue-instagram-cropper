
export default {
    methods: {
        $_c_preventZoomingToWhiteSpace() {
            if (this.imgData.width < this.outputWidth) {
                this.scaleRatio = this.outputWidth / this.naturalWidth;
            }
            if (this.imgData.height < this.outputHeight) {
                this.scaleRatio = this.outputHeight / this.naturalHeight;
            }
        },
        $_c_preventMovingToWhiteSpace() {
            if (this.imgData.startX > 0) {
                this.imgData.startX = 0;
            }
            if (this.imgData.startY > 0) {
                this.imgData.startY = 0;
            }
            if (this.outputWidth - this.imgData.startX > this.imgData.width) {
                this.imgData.startX = -(this.imgData.width - this.outputWidth);
            }
            if (this.outputHeight - this.imgData.startY > this.imgData.height) {
                this.imgData.startY = -(this.imgData.height - this.outputHeight);
            }
        },
    },
};
