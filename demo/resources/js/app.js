
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
    methods: {
        changeImageURL() {
            this.cropper = {
                url: 'https://images.unsplash.com/photo-1485841938031-1bf81239b815?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=628&q=80',
            };
        },
    },
});
