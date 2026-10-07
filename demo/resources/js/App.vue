<template>
    <section class="container">
        <div class="d-flex justify-content-center align-items-center px-2 py-4">
            <h4
                class="text-white text-center d-md-none"
                style="font-weight: 600;"
            >
                Vue Instagram Cropper
            </h4>
            <h1
                class="text-white d-none d-md-block"
                style="font-weight: 600; "
            >
                Vue Instagram Cropper
            </h1>
        </div>
    </section>

    <section class="container">
        <div class="d-flex justify-content-center align-items-center">
            <div class="bg-white p-4 rounded cropper-wrapper">
                <InstagramCropper
                    ref="cropper"
                    :src="cropper"
                    placeholder-color="#000000"
                    placeholder="Choose or Drag'n'Drop an image"
                    :placeholder-font-size="14"
                    :prevent-white-space="preventWhiteSpace"
                    @image-error="error = 'The image failed to load'"
                />
            </div>
        </div>
        <p
            v-if="error"
            class="text-danger text-center mt-2"
            v-text="error"
        />
    </section>

    <section class="container text-center mt-4">
        <h6 class="text-light">
            Some Methods
        </h6>
        <div class="row justify-content-center">
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="changeImageURL"
                >
                    Load other URL
                </button>
            </div>
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="changeImageObject"
                >
                    Load other Object
                </button>
            </div>
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="setToNull"
                >
                    Set object to null
                </button>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="download()"
                >
                    Download
                </button>
            </div>
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="download('image/jpeg', 0.8)"
                >
                    Download 20% compressed JPEG
                </button>
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="togglePreventWhiteSpace"
                    v-text="preventWhiteSpaceText"
                />
            </div>
            <div class="p-1 col-12 col-sm-auto">
                <button
                    class="btn btn-secondary"
                    @click="addCircleClip"
                >
                    Add circle clip
                </button>
            </div>
        </div>
    </section>

    <section class="container text-center mt-4">
        <h6 class="text-light">
            Vue.js component
        </h6>
        <a
            class="btn btn-danger"
            href="https://github.com/avidofood/vue-instagram-cropper"
            role="button"
        >Source on GitHub</a>

        <div class="social mt-4">
            <a
                href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                class="twitter-share-button"
                data-show-count="false"
            >Tweet</a>
            <a
                class="github-button"
                href="https://github.com/avidofood/vue-instagram-cropper"
                data-show-count="true"
                aria-label="Star avidofood/vue-instagram-cropper on GitHub"
            >Star</a>
        </div>
    </section>

    <section class="container mt-5">
        <div class="row">
            <div class="col-12 col-md-6">
                <h4
                    class="text-white d-md-none"
                    style="font-weight: 600;"
                >
                    Designed for Vue
                </h4>
                <h2
                    class="text-white d-none d-md-block"
                    style="font-weight: 600; "
                >
                    Designed for Vue
                </h2>
            </div>
            <div class="col-12 col-md-6">
                <p class="text-white">
                    It feels like the image cropper from Instagram. Get the extension
                    <a
                        href="https://github.com/avidofood/vue-cropgram"
                        class="text-danger font-weight-bold"
                    >Vue Instagram Image Upload</a> for a full experience.
                </p>
            </div>
        </div>
    </section>
</template>

<script>
import InstagramCropper from '../../../src/index';

export default {
    components: {
        InstagramCropper,
    },
    data() {
        return {
            error: '',
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
            this.error = '';
            this.cropper = 'https://images.unsplash.com/photo-1485841938031-1bf81239b815?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=628&q=80';
        },
        changeImageObject() {
            this.error = '';
            const img = new Image();
            img.crossOrigin = 'anonymous';

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
                this.error = 'The image failed to load';
            };

            img.src = 'https://images.unsplash.com/photo-1559124778-aa10b8898cc0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=562&q=80';
        },
        async download(type, compressionRate) {
            const blob = await this.$refs.cropper.promisedBlob(type, compressionRate);
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = 'filename';
            a.href = url;
            a.click();
            URL.revokeObjectURL(url);
        },
        setToNull() {
            this.error = '';
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
};
</script>
