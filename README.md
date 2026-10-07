# Instagram Cropper for Vue 🖼

<a href="https://www.npmjs.com/package/vue-instagram-cropper">
  <img src="https://img.shields.io/npm/dt/vue-instagram-cropper.svg" alt="Downloads">
</a>
<a href="https://www.npmjs.com/package/vue-instagram-cropper">
  <img src="https://img.shields.io/npm/v/vue-instagram-cropper.svg" alt="Version">
</a>
<a href="https://www.npmjs.com/package/vue-instagram-cropper">
  <img src="https://img.shields.io/npm/l/vue-instagram-cropper.svg" alt="License">
</a>

<a href="https://avidofood.github.io/vue-instagram-cropper"><img src="/images/intro.png" width="400" alt="try it out" /></a>

**If you are looking to crop and upload images like in Instagram, please visit https://github.com/avidofood/vue-cropgram 😜**

 >**Prerequisites**: Vue 3.2 or newer for version 2.x of this package. For Vue 2, use version 1.x.

## Installation in 2 Steps

### 1: Add with npm 💻
```bash
# For Vue 3.x.x
npm install vue-instagram-cropper

# For Vue 2.x.x
npm install vue-instagram-cropper@1x
```

### 2a: Import the component

```vue
<script setup>
import InstagramCropper from 'vue-instagram-cropper';
</script>
```

Or register it globally:

```javascript
import { createApp } from 'vue';
import InstagramCropper from 'vue-instagram-cropper';

const app = createApp(App);
app.component('InstagramCropper', InstagramCropper);
```

### 2b: Install as a plugin
```javascript
import { createApp } from 'vue';
import { Plugin } from 'vue-instagram-cropper';

const app = createApp(App);
app.use(Plugin);
```

The plugin registers the component as `InstagramCropper`. You can use it as `<InstagramCropper>` or `<instagram-cropper>`.

### TypeScript

Since version 2.0.0 the package contains type declarations for the props, the metadata, the events, the methods and the plugin.

```typescript
import type { InstagramCropperEmits } from 'vue-instagram-cropper';

// Right after remove(), the metadata can have no image
const onUpdate: InstagramCropperEmits['update'] = (metadata) => {
    if (metadata.img) console.log(metadata.imgData);
};
```

## Usage - (or to make it runnable 🏃‍♂️)


### Easiest version 🔍

```html
 <instagram-cropper 
    :src="cropper"
 ></instagram-cropper>

 with 

 cropper: 'https://i.picsum.photos/id/468/200/300.jpg',
```

The component takes the size of its container. Give it a width and a height, for example with a class. When the container changes its size, the canvas follows. This also works for a container that is hidden at first, for example with `v-show`. Without `ResizeObserver`, for example in jsdom, the size stays as it was at the mount.

### Advanced version 🌐

```html
 <instagram-cropper
    ref="cropper"
    class="w-100 h-100"
    :src="cropper"
    :quality="4"
    :placeholder-font-size="14"
    placeholder-color="#000000" 
    placeholder="Choose or Drag'n'Drop an image"
 >
    <spinner v-if="loading"/>
 </instagram-cropper>
```

### Demo ⚡️

https://avidofood.github.io/vue-instagram-cropper

## Props

This package is made to imitate Instagram's cropper.

### Props values

- `src` (required: `false`, type: String or Object)

You can set the source of the placeholder image here. You can also use objects to set images. Test it by saving the meta-object by calling the method `getMetadata()`.

- `quality` (default: `2`)

Multiplies your image output. If your canvas is 600px wide and the quality is set to 2, the output width will be 1200.

- `canvasColor` (default: `#F7F7F7`)
 

- `placeholder` (default: `Choose an image`)
- `placeholderColor` (default: `#67ACFD`)
- `placeholderFontSize` (default: `0`)
  
With `0`, the component calculates the font size.

- `fileSizeLimit` (default: `0`)
  
The largest file size in bytes. `0` means no limit. A larger file emits `file-size-exceed`.

- `forceCacheBreak` (default: `false`)

If you still have CORS issues, set it to `true`. The browser then does not cache the images. Data URLs and blob URLs stay as they are.

- `preventWhiteSpace` (default: `false`)

Keeps the canvas filled with the image while the user moves or zooms it.

### Image orientation

Photos from a phone often contain an EXIF orientation. Browsers turn these images correctly by themselves since 2020 (Chrome 81, Firefox 77, Safari 13.1). Version 2.0 draws the image as the browser shows it.

## Events 

- `init`: The component is ready. The event carries the component.
- `initial-image-loaded`: The image from `src` loaded for the first time.
- `file-choose`: The user chose a file. The event carries the file.
- `file-size-exceed`: The file is larger than `fileSizeLimit`.
- `file-type-mismatch`: The file is not an image.
- `file-loaded`: The component read the new file.
- `new-image`: The component read a new valid image.
- `new-image-drawn`: The component drew a new image on the canvas for the first time.
- `image-error`: The image failed to load (`onerror` listener).
- `image-remove`: The user or `remove()` removed the image.
- `image-remove-onload`: The component removed the old image for a new file or a new `src`.
- `move`: The user or `move()` moved the image.
- `zoom`: The user or `zoom()` changed the size of the image.
- `draw`: The component drew the view again. The event carries the canvas context.
- `loading-start`: The image starts to load.
- `loading-end`: The image finished loading.
- `update`: The component drew a new view. The event carries the metadata, see `getMetadata()`. Right after `remove()`, the metadata can have no image (`img` is `null`).
- `input`: The component removed the image. The value is `null`.

The component also emits native events of the canvas again. These are `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove` and `wheel`. These are `touchstart`, `touchend`, `touchcancel` and `touchmove`. These are `pointercancel`, `pointermove` and `pointerleave`. For the drag and drop of a file, it emits `dragenter`, `dragleave`, `dragover` and `drop` of the container.

## Methods

You need to set `ref="cropper"` to the HTML tag `<instagram-cropper>`. After that you can call all methods like this `this.$refs.cropper.hasImage()`.

With `<script setup>`, use a template ref:

```vue
<script setup>
import { ref } from 'vue';
import InstagramCropper from 'vue-instagram-cropper';

const cropper = ref(null);

const save = async () => {
    const blob = await cropper.value.promisedBlob('image/jpeg', 0.8);
};
</script>

<template>
    <InstagramCropper ref="cropper" src="/images/photo.jpg" />
</template>
```

- `getCanvas()`: returns the canvas object
- `getContext()`: returns the canvas context object
- `getChosenFile()`: returns File object
- `chooseFile()`: Opens the file chooser window to choose an image.
- `refresh()`: Starts the component again, for example to load the initial image again.
- `hasImage()`: Return boolean value indicating whether currently there is a image.
- `remove()`: Removes the image and shows the placeholder.
- `move({ x: number, y: number })`: Moves the image by `x` and `y` canvas pixels.
- `zoom( zoomIn: boolean, acceleration: number )`: Zooms in or out by one step. `zoomIn` defaults to `true`, `acceleration` to 1.
- `generateDataUrl( type: string, compressionRate: number, options: object )`: 
   - Returns a data-URL containing a representation of the image in the format specified by the type parameter (defaults to png).
   - `compressionRate` defaults to 1, you can pass a number between 0 and 1 to get a compressed output image.
   - `options` sets the output size, see [Output size](#output-size).
   - If there is no image, it returns an empty string.
- `generateBlob( callback: function, mimeType: string, compressionRate: number, options: object )`: 
   - Creates a Blob object representing the image contained in the canvas.
   - If there is no image, the first argument of callback function is null.
- `promisedBlob( mimeType: string, compressionRate: number, options: object )`: 
   - Returns a Promise around `generateBlob()`. With it, you can use async/await instead of a callback.
   - If there is no image, the promise resolves with `null`.
- `getMetadata()`: Returns an object with the image, its position and its scale. Pass it to `src` to show the image with the same crop again, for example in a list of images.
- `saving(img, imgData, outputWidth, outputHeight)`: Creates the output for other metadata, for example for an image in a list. It returns an object with `generateDataUrl()`, `generateBlob()` and `promisedBlob()`. Pass the `outputWidth` and `outputHeight` of the component.

```javascript
const blob = await this.$refs.cropper.promisedBlob()
``` 

### Output size

Without options, the output has the size of the visible image in canvas pixels: the container size times `quality`. The last argument of `generateDataUrl()`, `generateBlob()`, `promisedBlob()` and of the object from `saving()` sets another size:

- `width` or `height`: that side gets this size. The other side keeps the aspect ratio.
- `width` and `height`: the output fits into this box.
- `maxWidth` and `maxHeight`: a larger output gets smaller. These options never make the output larger.

```javascript
// Always 1080 pixels wide, for example for Instagram
const blob = await this.$refs.cropper.promisedBlob('image/jpeg', 0.9, { width: 1080 });

// At most 2048 pixels on each side
const url = this.$refs.cropper.generateDataUrl('image/png', 1, { maxWidth: 2048, maxHeight: 2048 });
```

A size larger than the original image makes the output blurry. Very large canvases can fail in some browsers, for example on iOS. Use `maxWidth` and `maxHeight` to stay below that.

- `addClipPlugin(func)`: Add clip plugin to clip the image. Example:

```javascript
// Add a clip plugin to make a circle clip on image
onInit(vm) {
  this.$refs.cropper.addClipPlugin(function (ctx, x, y, w, h) {
    /*
     * ctx: canvas context
     * x: start point (top-left corner) x coordination
     * y: start point (top-left corner) y coordination
     * w: croppa width
     * h: croppa height
    */
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, 2 * Math.PI, true);
    ctx.closePath();
  })
},
``` 
>Note: In the plugin function, always start with `ctx.beginPath()` and end with `ctx.closePath()`.

>Note: Clip plugins only work with `prevent-white-space` set to `true`.

To remove all clip plugins, set `this.$refs.cropper.clipPlugins = null`.

## Upgrade from 1.x to 2.0

Version 2.0 is for Vue 3. The props, the events and the methods have the same names as in 1.x. These things changed:

1. Vue 3.2 or newer is required. For Vue 2, stay on version 1.x: `npm install vue-instagram-cropper@1x`.
2. Register the component with `app.component()` or `app.use(Plugin)` instead of `Vue.component()` or `Vue.use()`. The plugin registers the name `InstagramCropper`. The tag `<instagram-cropper>` still works.
3. Remove `.native` from listeners on the component. Vue 3 has no `.native` modifier. A listener such as `@click` gets the click on the canvas from the component, as in 1.x without `.native`.
4. The component no longer turns a chosen photo by its EXIF orientation. The browser does that already. In 1.x, photos from the iOS photo editor showed up turned twice ([#17](https://github.com/avidofood/vue-instagram-cropper/pull/17)).
5. The component no longer listens to and emits the legacy events `DOMMouseScroll` and `mousewheel`. Use `wheel`.
6. If there is no image, `promisedBlob()` resolves with `null`. In 1.x, the promise was rejected.
7. With `preventWhiteSpace`, zooming out at the smallest size emits no `zoom` event and does not move the image.
8. The package contains only the build in `dist/`. Import from `vue-instagram-cropper`. Imports such as `vue-instagram-cropper/src/...` or `vue-instagram-cropper/dist/index.common.js` no longer work. The UMD build sets the global variable `VueInstagramCropper` instead of `index`.
9. The package no longer adds polyfills for `requestAnimationFrame` and `canvas.toBlob()`. Every browser that Vue 3 supports has both. The 1.x polyfill also replaced `Array.isArray` on the whole page.
10. The package has no runtime dependencies. `canvas-exif-orientation` is gone.
11. Some fixes change what you can observe:
    - After a drag, the component no longer emits `mouseup` and the other end events for clicks elsewhere on the page.
    - `remove()` and `src` set to `null` stop an image that still loads and emit `loading-end`.
    - A slower image or file no longer replaces a newer one.
    - Several croppers on one page no longer share their image.
    - With `preventWhiteSpace`, metadata whose crop does not fill the canvas shows the image filled and centered.
    - Metadata of another image with the same size and crop draws the new image.
    - `forceCacheBreak` works with relative URLs and keeps data URLs and blob URLs as they are.
    - The container gets the class `cropper--dropzone` while a file is over it.

    The CHANGELOG lists all fixes.

## Development

You need Node.js 22.12 or newer (see `.nvmrc`).

```bash
npm install
npm test          # unit tests and type checks
npm run lint
npm run build     # builds dist/ and the demo
```

`npm pack` and `npm publish` build `dist/` first.

### Releases

1. Set the new version in `package.json` and add it to `CHANGELOG.md`.
2. Merge the change into `master`.
3. Push a tag with the version number, for example `git tag 2.0.1 && git push origin 2.0.1`.

The `Release` workflow then runs the lint and the tests, and publishes the package to npm. It uses npm trusted publishing, so it needs no npm token and no 2FA prompt. The tag must match the version in `package.json` and must be on `master`. Run the workflow by hand to check the setup. That run publishes nothing.

On npmjs.com, the trusted publisher of the package points to this repository, the workflow `release.yml` and the environment `npm-publish`. Under "Allowed actions", it must allow `npm publish`. A new trusted publisher expires after 2 days without a publish. Create it right before a release.

## TODO

I have only limited time to develop this package further. Your help to improve it step by step means a lot to me. Here is a small list of what is still missing:

- The grid shows only while the user moves the image. It also needs to show while the user zooms.
- The maximum zoom limit is not the same as in Instagram
- We need the prop `forceAspect`. With it, you can "clip" the image to a specific aspect ratio. [vue-cropgram](https://github.com/avidofood/vue-cropgram) needs it for multiple images.
 
## Security

If you discover any security related issues, please do not email me. I'm afraid 😱. avidofood@protonmail.com

## Credits

Now comes the best part! 😍
This package is based on

 - https://github.com/zhanziyang/vue-croppa (but simplified)

Oh come on. You read everything?? If you liked it so far, hit the ⭐️ button to give me a 🤩 face. 

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
