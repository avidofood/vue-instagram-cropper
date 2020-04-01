/**
 * We need to check if the image is too zoomed in or too zoomed out.
 * For wheel events our touching pinching
 */

export default {
    methods: {
        $_c_handleZoomWheel() {
            if (this.$_c_imageIsFullyZoomedOut()) {
                this.$_c_aspectFit();
                return;
            }

            if (this.$_c_imageReachedMaximumScale()) {
                this.scaleRatio = this.maximumScaleRatio;
            }

            this.$_c_checkBounceness();
        },


    },
};
