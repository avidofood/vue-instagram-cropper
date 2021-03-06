
import Vue from 'vue';
import InstagramCropper from '../../../src/index';

Vue.component('instagram-cropper', InstagramCropper);

new Vue({ // eslint-disable-line no-new
    el: '#app',
    data() {
        return {
            preventWhiteSpace: false,
            cropper: 'https://raw.githubusercontent.com/avidofood/vue-responsive-video-background-player/master/demo/public/images/hero-mobile%402.jpg',
        };
    },
    computed: {
        preventWhiteSpaceText() {
            return `preventWhiteSpace: ${this.preventWhiteSpace ? 'true' : 'false'}`;
        },
    },
    methods: {
        changeImageURL() {
            this.cropper = 'https://images.unsplash.com/photo-1485841938031-1bf81239b815?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=628&q=80';
        },
        changeImageObject() {
            const img = new Image();

            img.onload = () => {
                this.cropper = {
                    img,
                    imgData: {
                        width: 1768.2319410589407,
                        height: 3149.4664999999995,
                        startX: -1156.2319410589407,
                        startY: -1387.2325988051614,
                    },
                    scaleRatio: 3.1463201798201794,
                };
            };
            img.onerror = () => {
                alert('Imaged failed loading');
            };

            img.src = 'https://images.unsplash.com/photo-1559124778-aa10b8898cc0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=562&q=80';
        },
        download(type, compressionRate) {
            if (!this.$refs.cropper.hasImage()) return;

            this.$refs.cropper.generateBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.download = 'filename';
                a.href = url;
                a.click();
                URL.revokeObjectURL(url);
            }, type, compressionRate);
        },
        setToNull() {
            this.cropper = null;
        },
        togglePreventWhiteSpace() {
            this.preventWhiteSpace = !this.preventWhiteSpace;
        },
        addCircleClip() {
            if (!this.$refs.cropper.hasImage()) return;

            this.preventWhiteSpace = true;
            this.$refs.cropper.clipPlugins = null; // we need to reset the values
            this.$refs.cropper.addClipPlugin((ctx, x, y, w, h) => {
                ctx.beginPath();
                ctx.arc(x + w / 2, y + h / 2, w / 2, 0, 2 * Math.PI, true);
                ctx.closePath();
            });
            this.$refs.cropper.refresh();
        },

    },
});
