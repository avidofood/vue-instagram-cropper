export default {
    methods: {
        $_c_handleFullscreen() {
            if (this.$_c_imageIsFullyZoomedOut()) {
                this.$_c_aspectFill(); // WARNING THIS IS NOT WORKING REMEMBER?
                return;
            }
            if (this.$_c_imageIsFullyZoomedIn()) {
                this.$_c_aspectFit();
                return;
            }

            this.$_c_aspectFill();
        },
    },
};
