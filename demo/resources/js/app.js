
import Vue from 'vue';
import InstagramCropper from '../../../src/index';

Vue.component('instagram-cropper', InstagramCropper);

new Vue({ // eslint-disable-line no-new
    el: '#app',
});
