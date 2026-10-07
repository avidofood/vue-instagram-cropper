import type {
    ComponentOptionsMixin, DefineComponent, Plugin as VuePlugin, PropType,
} from 'vue';

/** Position and size of the image on the canvas, in canvas pixels. */
export interface InstagramCropperImageData {
    width: number;
    height: number;
    startX: number;
    startY: number;
}

/**
 * The image and its crop. getMetadata() and the update event return it. Pass it to the src prop
 * to show the image with the same crop again.
 */
export interface InstagramCropperMetadata {
    img: HTMLImageElement;
    imgData: InstagramCropperImageData;
    scaleRatio: number;
}

/** What getMetadata() returns without an image. */
export interface InstagramCropperEmptyMetadata {
    img: null;
    imgData: InstagramCropperImageData;
    scaleRatio: null;
}

/**
 * Draws a clip path on the canvas, for example a circle. Start with context.beginPath() and end
 * with context.closePath(). x, y, width and height describe the canvas.
 */
export type InstagramCropperClipPlugin = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
) => void;

/** Creates the output for an image and a crop. saving() returns it. */
export interface InstagramCropperSaving {
    generateDataUrl(type?: string, compressionRate?: number): string;
    generateBlob(
        callback: (blob: Blob | null) => void,
        mimeType?: string,
        compressionRate?: number,
    ): void;
    promisedBlob(mimeType?: string, compressionRate?: number): Promise<Blob | null>;
}

export interface InstagramCropperProps {
    /** URL of the image, or the metadata from getMetadata(). Without it, the placeholder shows. */
    src?: string | InstagramCropperMetadata | null;
    /** Multiplies the size of the canvas and of the output. Default: 2. */
    quality?: number;
    /** Default: '#F7F7F7'. */
    canvasColor?: string;
    /** Default: 'Choose an image'. */
    placeholder?: string;
    /** Default: '#67ACFD'. */
    placeholderColor?: string;
    /** Font size of the placeholder in pixels. 0 calculates the size. Default: 0. */
    placeholderFontSize?: number;
    /** Largest file size in bytes. 0 means no limit. Default: 0. */
    fileSizeLimit?: number;
    /** Adds a parameter to the URL, so the browser loads the image again. Default: false. */
    forceCacheBreak?: boolean;
    /** Keeps the canvas filled when the user moves or zooms the image. Default: false. */
    preventWhiteSpace?: boolean;
}

/**
 * The methods of the component. Call them through a template ref. A type instead of an interface,
 * because Vue needs an index signature here.
 */
export type InstagramCropperMethods = {
    getCanvas(): HTMLCanvasElement;
    getContext(): CanvasRenderingContext2D;
    /** The file that the user chose or dropped. */
    getChosenFile(): File | undefined;
    /** Opens the file chooser of the browser. */
    chooseFile(): void;
    /** Starts the component again, for example to load the src again. */
    refresh(): void;
    hasImage(): boolean;
    /** Removes the image and shows the placeholder. */
    remove(): void;
    /** Moves the image by x and y canvas pixels. */
    move(offset: { x: number; y: number }): void;
    /** Zooms in or out by one step. Default: zoomIn true, acceleration 1. */
    zoom(zoomIn?: boolean, acceleration?: number): void;
    /** Returns an empty string without an image. Default type: 'image/png'. */
    generateDataUrl(type?: string, compressionRate?: number): string;
    /** Calls the callback with null without an image. */
    generateBlob(
        callback: (blob: Blob | null) => void,
        mimeType?: string,
        compressionRate?: number,
    ): void;
    /** Resolves with null without an image. */
    promisedBlob(mimeType?: string, compressionRate?: number): Promise<Blob | null>;
    getMetadata(): InstagramCropperMetadata | InstagramCropperEmptyMetadata;
    /** Clips the image. Works only with preventWhiteSpace. */
    addClipPlugin(plugin: InstagramCropperClipPlugin): void;
    /** Creates the output for other metadata, for example of an image in a list. */
    saving(
        img: HTMLImageElement,
        imgData: InstagramCropperImageData,
        outputWidth: number,
        outputHeight: number,
    ): InstagramCropperSaving;
};

export type InstagramCropperEmits = {
    /** The component is ready. */
    init: (cropper: InstagramCropperMethods) => void;
    'file-choose': (file: File) => void;
    'file-size-exceed': (file: File) => void;
    'file-type-mismatch': (file: File) => void;
    'file-loaded': () => void;
    'new-image': () => void;
    'new-image-drawn': () => void;
    'image-error': () => void;
    'image-remove': () => void;
    'image-remove-onload': () => void;
    move: () => void;
    zoom: () => void;
    draw: (context: CanvasRenderingContext2D) => void;
    'initial-image-loaded': () => void;
    'loading-start': () => void;
    'loading-end': () => void;
    update: (metadata: InstagramCropperMetadata) => void;
    /** Emitted with null when the image is removed. */
    input: (value: null) => void;
    // The component emits these events of the canvas and the container again
    click: (event: MouseEvent) => void;
    dblclick: (event: MouseEvent) => void;
    mousedown: (event: MouseEvent) => void;
    mouseup: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    touchstart: (event: TouchEvent) => void;
    touchend: (event: TouchEvent) => void;
    touchcancel: (event: TouchEvent) => void;
    touchmove: (event: TouchEvent) => void;
    pointercancel: (event: PointerEvent) => void;
    pointermove: (event: PointerEvent) => void;
    pointerleave: (event: PointerEvent) => void;
    wheel: (event: WheelEvent) => void;
    dragenter: (event: DragEvent) => void;
    dragleave: (event: DragEvent) => void;
    dragover: (event: DragEvent) => void;
    drop: (event: DragEvent) => void;
};

/**
 * The props as runtime options, like in the component. Vue 3.2 reads the defaults only from
 * this form, not from a plain interface.
 */
type InstagramCropperPropOptions = {
    src: { type: PropType<string | InstagramCropperMetadata | null>; required: false };
    quality: { type: PropType<number>; default: number };
    canvasColor: { type: PropType<string>; default: string };
    placeholder: { type: PropType<string>; default: string };
    placeholderColor: { type: PropType<string>; default: string };
    placeholderFontSize: { type: PropType<number>; default: number };
    fileSizeLimit: { type: PropType<number>; default: number };
    forceCacheBreak: { type: PropType<boolean>; default: boolean };
    preventWhiteSpace: { type: PropType<boolean>; default: boolean };
};

declare const InstagramCropper: DefineComponent<
    InstagramCropperPropOptions,
    {},
    {
        /** Set it to null to remove all clip plugins. */
        clipPlugins: InstagramCropperClipPlugin[] | null;
    },
    {
        /** Width of the canvas in canvas pixels: the width of the container times quality. */
        outputWidth: () => number;
        /** Height of the canvas in canvas pixels: the height of the container times quality. */
        outputHeight: () => number;
    },
    InstagramCropperMethods,
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    InstagramCropperEmits
>;

/** Registers the component globally as InstagramCropper. */
export declare const Plugin: VuePlugin;

export default InstagramCropper;

declare module 'vue' {
    export interface GlobalComponents {
        InstagramCropper: typeof InstagramCropper;
    }
}
