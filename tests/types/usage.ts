// Compile-time checks for src/index.d.ts. Run with: npm run test:types
import { createApp, h, type GlobalComponents } from 'vue';
import InstagramCropper, {
    Plugin,
    type InstagramCropperClipPlugin,
    type InstagramCropperEmptyMetadata,
    type InstagramCropperInstance,
    type InstagramCropperMetadata,
    type InstagramCropperProps,
} from '../../src/index';

createApp({}).use(Plugin);
createApp({}).component('InstagramCropper', InstagramCropper);

const props: InstagramCropperProps = {
    src: 'https://example.com/photo.jpg',
    quality: 4,
    canvasColor: '#000000',
    placeholder: 'Choose or drop an image',
    placeholderColor: '#ffffff',
    placeholderFontSize: 14,
    fileSizeLimit: 1024 * 1024,
    forceCacheBreak: true,
    preventWhiteSpace: true,
};

h(InstagramCropper, {
    ...props,
    // After remove(), a pending update carries metadata without an image
    onUpdate: (metadata: InstagramCropperMetadata | InstagramCropperEmptyMetadata) => (
        metadata.img ? metadata.img.src : metadata.imgData.width
    ),
    // vue-cropgram creates the output with the instance from init
    onInit: (vm: InstagramCropperInstance) => {
        const { img, imgData } = vm.getMetadata();
        if (img) vm.saving(img, imgData, vm.outputWidth, vm.outputHeight);
        return vm.preventWhiteSpace && vm.quality;
    },
    onDraw: (context: CanvasRenderingContext2D) => context.canvas,
    onClick: (event: MouseEvent) => event.clientX,
});

// No props are required
h(InstagramCropper);
h(InstagramCropper, { src: null });

const strictUpdate = (metadata: InstagramCropperMetadata) => metadata.img.src;
// @ts-expect-error the payload can be metadata without an image
h(InstagramCropper, { onUpdate: strictUpdate });

// @ts-expect-error quality is a number
h(InstagramCropper, { quality: 'high' });

// @ts-expect-error src is a URL or metadata
h(InstagramCropper, { src: 42 });

declare const img: HTMLImageElement;
const metadata: InstagramCropperMetadata = {
    img,
    imgData: {
        width: 600, height: 450, startX: 0, startY: 75,
    },
    scaleRatio: 0.75,
};
h(InstagramCropper, { src: metadata });

// @ts-expect-error metadata needs imgData
const incomplete: InstagramCropperMetadata = { img, scaleRatio: 1 };

declare const cropper: InstanceType<typeof InstagramCropper>;
// A template ref fits where the init payload type is expected
const instance: InstagramCropperInstance = cropper;
const empty: InstagramCropperEmptyMetadata = {
    img: null,
    imgData: {
        width: 0, height: 0, startX: 0, startY: 0,
    },
    scaleRatio: 0,
};
const hasImage: boolean = cropper.hasImage();
const dataUrl: string = cropper.generateDataUrl('image/jpeg', 0.8);
const blob: Promise<Blob | null> = cropper.promisedBlob('image/jpeg', 0.8);
cropper.generateBlob((result: Blob | null) => result, 'image/png');
cropper.chooseFile();
cropper.refresh();
cropper.remove();
cropper.move({ x: 10, y: -10 });
cropper.zoom(false, 2);
const canvas: HTMLCanvasElement = cropper.getCanvas();
const context: CanvasRenderingContext2D = cropper.getContext();
const file: File | undefined = cropper.getChosenFile();

const current = cropper.getMetadata();
if (current.img !== null) {
    const restored: InstagramCropperMetadata = current;
    // vue-cropgram creates the output for other images with saving()
    const output: Promise<Blob | null> = cropper
        .saving(restored.img, restored.imgData, cropper.outputWidth, cropper.outputHeight)
        .promisedBlob('image/jpeg', 0.8);
    output.then(() => {});
}

const circle: InstagramCropperClipPlugin = (ctx, x, y, w, h2) => {
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h2 / 2, w / 2, 0, 2 * Math.PI, true);
    ctx.closePath();
};
cropper.addClipPlugin(circle);
cropper.clipPlugins = null;

// @ts-expect-error a clip plugin is a function
cropper.addClipPlugin('circle');

// The plugin registers the component globally for templates
const global: typeof InstagramCropper = {} as GlobalComponents['InstagramCropper'];

export {
    incomplete, hasImage, dataUrl, blob, canvas, context, file, global, instance, empty,
};
