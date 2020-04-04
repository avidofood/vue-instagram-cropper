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

## Installation in 2 Steps

### 1: Add with npm 💻
```bash
 npm install vue-instagram-cropper
```

### 2a: Install as a component

```javascript
 import InstagramCropper from 'vue-instagram-cropper'

 Vue.component('instagram-cropper', InstagramCropper);
```
### 2b: Install as a plugin 
```javascript
 import { Plugin } from 'vue-instagram-cropper'

 Vue.use(Plugin);
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

This package is made to immitate Instagram's cropper.

### Props values

- `src` (required: `false`, type: String or Object)

You can set the source of the placeholder image here. You can also use objects to set images. Test it by saving the meta-object by calling the method `getMetadata()`.

- `quality` (default: `2`)

Multiplies your image output. If your canvas is 600px wide and the quality is set to 2, the output width will be 1200.

- `canvasColor` (default: `#F7F7F7`)
 

- `placeholder` (default: `Choose an image`)
- `placeholderColor` (default: `#67ACFD`)
- `placeholderFontSize` (default: `0`)
  
Dynamic calculation when it's set to 0.

- `fileSizeLimit` (default: `0`)
  
If you love overlays, then copy the overlay from the advanced example.

- `forceCacheBreak` (default: `false`)

This is important if you have still CORS issues. But remember the browser is not caching images anymore.

- `preventWhiteSpace` (default: `false`)

Prevents revealing background white space when moving or zooming the image.

## Events 

- `init`: Initialized
- `initial-image-loaded`: Emitted when initial image loaded.
- `file-choose`: File was chosen
- `file-size-exceed`: File Size Limit was reached
- `file-type-mismatch`: Only images are accepted
- `file-loaded`: Emitted when a new file is received and read successfully
- `new-image`: Emitted when a new valid image is received and read successfully
- `new-image-drawn`: Emitted when a new image is drawn on canvas for the first time.
- `image-error`: Emitted when an error occurs for the image (`onerror`-listener)
- `image-remove`: Emitted when image is removed from croppa.
- `image-remove-onload`: Emitted when image is removed from croppa due to file-loaded or change of `src`.
- `move`: 
- `zoom`: 
- `draw`: Emitted on every view update
- `loading-start`: Emitted when image loading phase starts.
- `loading-end`: Emitted when image loading phase ends.
- `update`: When a new image is drawn, you get get the metadata via the event.

## Methods

You need to set `ref=cropper` to the HTML tag `<instagram-cropper>`. After that you can call all methods like this `this.$refs.cropper.hasImage()`.

- `getCanvas()`: returns the canvas object
- `getContext()`: returns the canvas context object
- `getChosenFile()`: returns File object
- `chooseFile()`: Opens the file chooser window to choose an image.
- `refresh()`: Reinitialize the component. Useful when you want to change initial image.
- `hasImage()`: Return boolean value indicating whether currently there is a image.
- `generateDataUrl( type: string, compressionRate: number )`: 
   - Returns a data-URL containing a representation of the image in the format specified by the type parameter (defaults to png).
   - `compressionRate` defaults to 1, you can pass a number between 0 and 1 to get a compressed output image.
- `generateBlob( callback: function, mimeType: string, compressionRate: number )`: 
   - Creates a Blob object representing the image contained in the canvas.
   - If there is no image, the first argument of callback function is null.
- `promisedBlob( mimeType: string, compressionRate: number )`: 
   - This method returns a Promise wrapping around generateBlob(), so that you can use async/await syntax instead of a callback to get blob data, it's simpler.
   - If there is no image, the first argument of callback function is null.
- `getMetadata()`: Gives an object back with all important information to create the image again at the same scale and position. Useful, if you are using a list of images.

```javascript
const blob = await this.$refs.cropper.promisedBlob()
``` 

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
>Note: in the plugin function you should always start with ctx.beginPath() and end with ctx.closePath().

>Note: it only works when prevent-white-space is true.

## TODO

I have only limited time to develop this package further. It would mean a lot to me, if you would help me to improve it step by step. Here is a small list, what is still missing:

- When zooming, the grid should be visible (Only moving shows the grid right now)
- The maximum zoom limit is not the same as in Instagram
- We need the prop `forceAspect`. Important if you want to "clip" the image to a specific aspect ratio. Needed for multiple images with [vue-cropgram](https://github.com/avidofood/vue-cropgram)
 
## Security

If you discover any security related issues, please don't email me. I'm afraid 😱. avidofood@protonmail.com

## Credits

Now comes the best part! 😍
This package is based on

 - https://github.com/zhanziyang/vue-croppa (but simplefied)

Oh come on. You read everything?? If you liked it so far, hit the ⭐️ button to give me a 🤩 face. 
