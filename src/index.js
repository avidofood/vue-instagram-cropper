import component from './InstagramCropper.vue';

export const Plugin = {
    install(app) {
        // The PascalCase name also works as <instagram-cropper> in templates
        app.component('InstagramCropper', component);
    },
};

export default component;
