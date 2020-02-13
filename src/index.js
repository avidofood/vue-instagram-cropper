import component from './InstagramCropper.vue';

export const Plugin = {
    install(Vue) {
        Vue.component('instagram-cropper', component);
    },
};

export default component;
