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
- The polyfills for `requestAnimationFrame` and `canvas.toBlob()` are gone. Every browser that Vue 3 supports has both. The 1.x polyfill also replaced `Array.isArray` on the whole page.

### Added

- TypeScript types for the props, the metadata, the events, the methods and the plugin. The types also register `InstagramCropper` as a global component for template type checks. See [#6](https://github.com/avidofood/vue-instagram-cropper/issues/6).

### Fixed

- Several croppers on one page work independently. In 1.x, all croppers shared one state object, so they shared their image.
- Several croppers that mount at the same time load their own images. In 1.x, they shared one timer, and only the last cropper loaded its image.
- After a drag, the component removes its listeners from the document. In 1.x, they stayed, and the component emitted `mouseup` and similar events for clicks anywhere on the page.
- On unmount, the component removes all listeners and cancels a pending image load. In 1.x, a load after the unmount threw a `TypeError`.
- `forceCacheBreak` works with a relative URL such as `/images/photo.jpg`. In 1.x, it threw a `TypeError`. A data URL or blob URL stays as it is. In 1.x, the added parameter broke it.
- While a file is over the cropper, the container gets the class `cropper--dropzone`. The styles existed in 1.x, but the class was never set.
- With `preventWhiteSpace`, zooming out at the smallest size no longer moves the image sideways and emits no `zoom` event.

### Changed

- The package has no runtime dependencies. `canvas-exif-orientation` is gone.
- The package declares `"type": "commonjs"` and `"exports"` with `types` conditions. The ES module build is `dist/vue-instagram-cropper.mjs`, the UMD build is `dist/vue-instagram-cropper.umd.js`. As in 1.x, the CSS is part of the JavaScript files.
- The build uses Vite 8. Tests use Vitest. Linting uses ESLint 9 and eslint-config-avidofood 4. The development tools need Node.js 22.12 or newer. The published files have no Node.js requirement.
- `npm pack` and `npm publish` build `dist/` first (`prepack`). The repository no longer contains `dist/`.
- The demo uses Vue 3.
- With the new lockfile, `npm audit` finds no vulnerabilities. The 122 open Dependabot alerts of 1.x all came from its build tools (vue-cli 4, laravel-mix 5, webpack 4). None of them reached the published package.

## 1.1.5 and older

See the `1x` branch and the [releases on npm](https://www.npmjs.com/package/vue-instagram-cropper?activeTab=versions).
