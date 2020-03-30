<template>
    <div
        class="cropper-container"
        :class="img ? 'cropper--has-target' : ''"
        :style="'background-color:' + canvasColor + ';'"
        @dragenter.stop.prevent="$_c_handleDragEnter"
        @dragleave.stop.prevent="$_c_handleDragLeave"
        @dragover.stop.prevent="$_c_handleDragOver"
        @drop.stop.prevent="$_c_handleDrop"
    >
        <input
            type="file"
            accept="image/*"
            ref="fileInput"
            @change="$_c_handleInputChange"
            style="height:1px;width:1px;overflow:hidden;margin-left:-99999px;position:absolute;"
        >
        <canvas
            ref="canvas"
            @click.stop.prevent="$_c_handleClick"
            @dblclick.stop.prevent="$_c_handleDblClick"
            @touchstart.stop="$_c_handlePointerStart"
            @mousedown.stop.prevent="$_c_handlePointerStart"
            @pointerstart.stop.prevent="$_c_handlePointerStart"
            @touchend.stop.prevent="$_c_handlePointerEnd"
            @touchcancel.stop.prevent="$_c_handlePointerEnd"
            @mouseup.stop.prevent="$_c_handlePointerEnd"
            @pointerend.stop.prevent="$_c_handlePointerEnd"
            @pointercancel.stop.prevent="$_c_handlePointerEnd"
            @touchmove.stop="$_c_handlePointerMove"
            @mousemove.stop.prevent="$_c_handlePointerMove"
            @pointermove.stop.prevent="$_c_handlePointerMove"
            @pointerleave.stop.prevent="$_c_handlePointerLeave"
            @DOMMouseScroll.stop="$_c_handleWheel"
            @wheel.stop="$_c_handleWheel"
            @mousewheel.stop="$_c_handleWheel"
        />

        <SpinnerCircle v-if="loading" />

        <slot />

        <FullscreenButton
            v-if="img && aspectRatio !== 1 && !preventWhiteSpace"
            @click.native="$_c_handleFullscreen"
        />
        <RemoveButton
            v-if="img"
            @click.native="remove()"
        />
    </div>
</template>

<script>
import props from './core/props';
import propsOptions from './core/propsOptions';
import data from './core/data';
import events from './core/events';
import * as Settings from './core/const';

import initialize from './mixins/initialize';
import canvas from './mixins/canvas';
import placeholder from './mixins/placeholder';
import computed from './mixins/computed';
import image from './mixins/image';
import handleMethods from './mixins/handleMethods';
import watches from './mixins/watches';
import fileinput from './mixins/fileinput';

import fullscreenButtonMethods from './mixins/buttons/fullscreenButtonMethods';
import handleBounce from './mixins/clipping/handleBounce';
import handleZoom from './mixins/clipping/handleZoom';
import handlePrevent from './mixins/clipping/handlePrevent';
import clips from './mixins/clipping/clips';
import ruleofthirdGrid from './mixins/layer/ruleofthirdGrid';

import SpinnerCircle from './components/spinner/SpinnerCircle.vue';
import FullscreenButton from './components/buttons/FullscreenButton.vue';
import RemoveButton from './components/buttons/RemoveButton.vue';

import deepClone from './lib/deepClone';
import Saving from './lib/Saving';


export default {
    props: { ...props, ...propsOptions },
    mixins: [
        watches,
        initialize,
        canvas,
        placeholder,
        computed,
        image,
        handleMethods,
        fullscreenButtonMethods,
        handleBounce,
        handleZoom,
        handlePrevent,
        clips,
        fileinput,
        ruleofthirdGrid,
    ],
    components: {
        SpinnerCircle,
        FullscreenButton,
        RemoveButton,
    },
    data() {
        return data;
    },
    methods: {
        emitEvent(...args) {
            this.$emit(...args);
        },
        remove(event = events.IMAGE_REMOVE_EVENT) {
            if (!this.imageSet) return;
            this.$_c_setPlaceholders();

            const hadImage = this.img != null;

            this.$_c_reset_values();

            if (hadImage) {
                this.emitEvent(event);
            }
        },
        move(offset) {
            if (!offset) return;

            const oldX = this.imgData.startX;
            const oldY = this.imgData.startY;
            this.imgData.startX += offset.x;
            this.imgData.startY += offset.y;

            if (this.preventWhiteSpace) {
                this.$_c_preventMovingToWhiteSpace();
            }

            if (this.imgData.startX !== oldX || this.imgData.startY !== oldY) {
                this.emitEvent(events.MOVE_EVENT);
                this.$_c_draw();
            }
        },
        hasImage() {
            return !!this.imageSet;
        },
        chooseFile() {
            this.$refs.fileInput.click();
        },
        zoom(zoomIn = true, acceleration = 1) {
            const realSpeed = Settings.ZOOM_SPEED * acceleration;
            const speed = (this.outputWidth * Settings.PCT_PER_ZOOM) * realSpeed;
            let x = 1;
            if (zoomIn) {
                x = 1 + speed;
            } else if (this.imgData.width > Settings.MIN_WIDTH) {
                x = 1 - speed;
            }
            // https://github.com/zhanziyang/vue-croppa/pull/204/files
            // when a new image is loaded with the same aspect ratio
            // as the previously remove()d one, the imgData.width and .height
            // effectivelly don't change (they change through one tick
            // and end up being the same as before the tick, so the
            // watchers don't trigger), make sure scaleRatio isn't null so
            // that zooming works...
            if (this.scaleRatio === null) {
                this.scaleRatio = this.imgData.width / this.naturalWidth;
            }

            this.scaleRatio *= x;
        },
        getCanvas() {
            return this.canvas;
        },
        getContext() {
            return this.ctx;
        },
        getChosenFile() {
            return this.chosenFile || this.$refs.fileInput.files[0];
        },
        refresh() {
            this.$nextTick(this.$_c_initialize);
        },
        saving(img, imgData, outputWidth, outputHeight) {
            return new Saving(img, imgData, outputWidth, outputHeight);
        },
        generateDataUrl(type, compressionRate) {
            if (!this.hasImage()) return '';

            return this.saving(this.img, this.imgData, this.outputWidth, this.outputHeight)
                .generateDataUrl(type, compressionRate);
        },
        generateBlob(callback, mimeType, qualityArgument) {
            if (!this.hasImage()) {
                callback(null);
                return;
            }
            this.saving(this.img, this.imgData, this.outputWidth, this.outputHeight)
                .generateBlob(callback, mimeType, qualityArgument);
        },
        promisedBlob(...args) {
            return this.saving(this.img, this.imgData, this.outputWidth, this.outputHeight)
                .promisedBlob(...args);
        },
        getMetadata() {
            return {
                img: this.img,
                imgData: deepClone(this.imgData),
                scaleRatio: deepClone(this.scaleRatio),
            };
        },
        addClipPlugin(plugin) {
            if (!this.clipPlugins) {
                this.clipPlugins = [];
            }
            if (typeof plugin === 'function' && this.clipPlugins.indexOf(plugin) < 0) {
                this.clipPlugins.push(plugin);
            } else {
                throw Error('Clip plugins should be functions');
            }
        },

    },
};
</script>

<style lang="scss" scoped>
.cropper-container{
    display: inline-block;
    cursor: pointer;
    position: relative;
    font-size: 0;
    align-self: flex-start;

    &:hover{
        opacity: 0.7;
    }

    &.cropper--dropzone{
        box-shadow: inset 0 0 10px #333;
        canvas{
            opacity: 0.5;
        }
    }

    &.cropper--has-target{
        cursor: move;
        &:hover{
            opacity: 1;
        }
    }
}


</style>
