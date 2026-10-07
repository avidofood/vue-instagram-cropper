# Changelog

This file lists the changes of version 2.x (Vue 3). Version 1.x (Vue 2) is on the `1x` branch.

## 2.0.0

Version 2.0 is for Vue 3. The props, the events and the methods keep their names from 1.x. The README has a section about the upgrade from 1.x.

### Breaking changes

- Vue 3.2 or newer is required (`vue` is a peer dependency). For Vue 2, use version 1.x.
- Register the component with `app.component()` or `app.use(Plugin)`. The plugin registers the name `InstagramCropper`. The tag `<instagram-cropper>` still works.
- Vue 3 has no `.native` modifier. The component declares the native events that it emits again, for example `click`. A listener such as `@click` gets these events from the component, as in 1.x without `.native`.
- The component no longer turns a chosen photo by its EXIF orientation. Browsers do that themselves since 2020 (Chrome 81, Firefox 77, Safari 13.1). In 1.x, photos from the iOS photo editor showed up turned twice. Thanks to @Alghost, who found the problem in [#17](https://github.com/avidofood/vue-instagram-cropper/pull/17).
- The component no longer listens to and emits `DOMMouseScroll` and `mousewheel`. Use `wheel`.
- If there is no image, `promisedBlob()` resolves with `null`, as the README says. In 1.x, the promise was rejected.
- The package contains only `dist/`. The file names in `dist/` changed. Import from `vue-instagram-cropper`. Imports from `vue-instagram-cropper/src/...` or `vue-instagram-cropper/dist/index.common.js` no longer work.
- The UMD build, for example from unpkg, sets the global variable `VueInstagramCropper`. In 1.x, it was `index`.
- The polyfills for `requestAnimationFrame` and `canvas.toBlob()` are gone. Every browser that Vue 3 supports has both. The 1.x polyfill also replaced `Array.isArray` on the whole page.

### Added

- The cropper follows the size of its container with a `ResizeObserver`. In 1.x, it measured the container only on a window resize. In 1.x, a container that was hidden at first got a canvas of 20 x 20 pixels. An example is `v-show`: the size `100%` was read as 10 pixels. Now the component places the image as soon as the container shows up. A container that hides and shows again with the same size keeps the crop.
- The rule-of-thirds grid also shows while the user zooms with the wheel, the keys or two fingers. It stays for half a second after the last zoom step. In 1.x, it only showed while the user moved the image. The new prop `showGrid` (default `true`) can hide it.
- Keyboard support: the canvas can get the focus. The arrow keys move the image, plus and minus zoom it, and Enter opens the file chooser. The canvas and the two buttons have texts for screen readers. The new prop `labels` replaces them, for example in another language. The hidden file input is no longer a tab stop without a visible focus. In 1.x, the cropper only worked with a mouse or a finger.
- The README shows how to use the cropper with Nuxt and how to crop every image to the same aspect ratio and size. Tests check the server-side rendering and the hydration.
- The new prop `crossOrigin` (default `anonymous`). Set `use-credentials` for an image server that needs the cookies of the user. In 1.x, the mode was always `anonymous`.
- The new prop `zoomOnWheel` (default `true`). With `false`, the wheel does not zoom, and the page scrolls over the cropper. In 1.x, the cropper always blocked the page scroll once it had an image.
- An optional last argument sets the output size: `width`, `height`, `maxWidth` and `maxHeight`. It works for `generateDataUrl()`, `generateBlob()`, `promisedBlob()` and the same methods of the object from `saving()`. Without it, the output has the visible size in canvas pixels, as in 1.x. An output side over 32767 pixels throws a `RangeError`.
- TypeScript types for the props, the metadata, the events, the methods and the plugin. The types also register `InstagramCropper` as a global component for template type checks. See [#6](https://github.com/avidofood/vue-instagram-cropper/issues/6).

### Fixed

- Several croppers on one page work independently. In 1.x, all croppers shared one state object, so they shared their image.
- Several croppers that mount at the same time load their own images. In 1.x, they shared one timer, and only the last cropper loaded its image.
- After a drag, the component removes its listeners from the document. In 1.x, they stayed, and the component emitted `mouseup` and similar events for clicks anywhere on the page.
- On unmount, the component removes all listeners and ignores an image or a file that finishes loading later. In 1.x, such a load threw a `TypeError`.
- A slow image or file can no longer replace a newer one. This also holds in the 30ms before a new `src` starts to load. In 1.x, an image that the user replaced showed up after its load finished.
- `remove()` while an image loads stops that image. `remove()` and `src` set to `null` end the loading state. In 1.x, the image showed up later, and the spinner stayed.
- `refresh()` right before the unmount no longer throws a `TypeError`.
- The output no longer loses a row or a column because of floating point. In 1.x, a 4:5 crop of 640 x 800 pixels gave an output of 640 x 799 pixels. A container size such as 401.25 pixels keeps its fraction.
- `remove()` in a `mouseup` or `touchend` handler during a drag ends the drag. In 1.x, the next image followed the mouse without a pressed button.
- `remove()` in an event handler during a load or a draw removes the image. Examples are `file-choose`, `image-remove-onload`, `file-loaded`, `initial-image-loaded` and the first `draw`. In 1.x, the image showed up anyway.
- Metadata of another image with the same size and crop draws the new image. In 1.x, the old image stayed on the canvas.
- `forceCacheBreak` works with a relative URL such as `/images/photo.jpg`, also on a page with a `<base>` element. In 1.x, it threw a `TypeError`. A data URL or blob URL stays as it is. In 1.x, the added parameter broke it.
- While a file is over the cropper, the container gets the class `cropper--dropzone`. The styles existed in 1.x, but the class was never set.
- With `preventWhiteSpace`, zooming out at the smallest size no longer moves the image sideways and emits no `zoom` event.

### Changed

- The package has no runtime dependencies. `canvas-exif-orientation` is gone.
- A size change without an image redraws the placeholder. In 1.x, it started the component again and emitted `init` a second time.
- The package declares `"type": "commonjs"` and `"exports"` with `types` conditions. The ES module build is `dist/vue-instagram-cropper.mjs`, the UMD build is `dist/vue-instagram-cropper.umd.js`. As in 1.x, the CSS is part of the JavaScript files.
- The build uses Vite 8. Tests use Vitest and jsdom 30, the type tests TypeScript 7. Linting uses ESLint 9 and eslint-config-avidofood 4. The development tools need Node.js ^22.22.2 or ^24.15.0, because of jsdom 30. The published files have no Node.js requirement.
- `npm pack` and `npm publish` build `dist/` first (`prepack`). The repository no longer contains `dist/`.
- The demo uses Vue 3.
- With the new lockfile, `npm audit` finds no vulnerabilities. The 122 open Dependabot alerts of 1.x all came from its build tools (vue-cli 4, laravel-mix 5, webpack 4). None of them reached the published package.

## 1.1.5 and older

See the `1x` branch and the [releases on npm](https://www.npmjs.com/package/vue-instagram-cropper?activeTab=versions).
