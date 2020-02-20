
import Vue from 'vue';
import InstagramCropper from '../../../src/index';

Vue.component('instagram-cropper', InstagramCropper);

new Vue({ // eslint-disable-line no-new
    el: '#app',
    data() {
        return {
            cropper: {
                url: 'https://raw.githubusercontent.com/avidofood/vue-responsive-video-background-player/master/demo/public/images/hero-mobile%402.jpg',
            },
        };
    },
});
