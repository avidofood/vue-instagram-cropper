# Instagram Cropper for Vue 🖼


![Vue Instagram Cropper](/images/intro.png)

**If you are looking to crop and upload images like in Instagram, please visit https://github.com/avidofood/vue-instagram-image-upload 😜**

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
    v-model="cropper"
 ></instagram-cropper>

 with 

 cropper: {
    url: 'http path to img',
 },
```

### Advanced version 🌐

```html
 <instagram-cropper
    ref="cropper"
    class="w-100 h-100"
    v-model="cropper"
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

- `v-model` (required: `false`, type: Object)

This is your object for giving existing URL images. After adding a new image, you get additional meta information of the image.

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

## Events 

- `init`: Initialized
- `file-choose`: File was chosen
- `file-size-exceed`: File Size Limit was reached
- `file-type-mismatch`: Only images are accepted
- `new-image`: Emitted when a new valid image is received and read successfully
- `new-image-drawn`: Emitted when a new image is drawn on canvas for the first time.
- `image-remove`: Emitted when image remove from croppa.
- `move`: 
- `zoom`: 
- `draw`: Emitted on every view update
- `initial-image-loaded`: Emitted when initial image loaded.
- `loading-start`: Emitted when image loading phase starts.
- `loading-end`: Emitted when image loading phase ends.

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

```javascript
const blob = await this.$refs.cropper.promisedBlob()
``` 
   
 
## Security

If you discover any security related issues, please don't email me. I'm afraid 😱. avidofood@protonmail.com

## Credits

Now comes the best part! 😍
This package is based on

 - https://github.com/zhanziyang/vue-croppa (but simplefied)

Oh come on. You read everything?? If you liked it so far, hit the ⭐️ button to give me a 🤩 face. 
