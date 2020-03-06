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
            v-if="img && aspectRatio !== 1"
            @click.native="$_c_handleFullscreen"
        />
        <RemoveButton
            v-if="img"
            @click.native="remove"
        />
    </div>
</template>

<script>
import props from './core/props';
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
import ruleofthirdGrid from './mixins/layer/ruleofthirdGrid';

import SpinnerCircle from './components/spinner/SpinnerCircle.vue';
import FullscreenButton from './components/buttons/FullscreenButton.vue';
import RemoveButton from './components/buttons/RemoveButton.vue';

import deepClone from './lib/deepClone';


export default {
    props,
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
        remove() {
            if (!this.imageSet) return;
            this.$_c_setPlaceholders();

            const hadImage = this.img != null;

            this.$_c_reset_values();

            if (hadImage) {
                this.emitEvent(events.IMAGE_REMOVE_EVENT);
            }
        },
        move(offset) {
            if (!offset) return;

            const oldX = this.imgData.startX;
            const oldY = this.imgData.startY;
            this.imgData.startX += offset.x;
            this.imgData.startY += offset.y;

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
        generateDataUrl(type, compressionRate) {
            if (!this.hasImage()) return '';
            return this.canvas.toDataURL(type, compressionRate);
        },
        generateBlob(callback, mimeType, qualityArgument) {
            if (!this.hasImage()) {
                callback(null);
                return;
            }
            this.canvas.toBlob(callback, mimeType, qualityArgument);
        },
        promisedBlob(...args) {
            if (typeof Promise === 'undefined') {
                console.warn('No Promise support. Please add Promise polyfill if you want to use this method.');
                return null;
            }
            return new Promise((resolve, reject) => {
                try {
                    this.generateBlob((blob) => {
                        resolve(blob);
                    }, ...args);
                } catch (err) {
                    reject(err);
                }
            });
        },
        getMetadata() {
            return {
                img: this.img,
                imgData: deepClone(this.imgData),
                scaleRatio: deepClone(this.scaleRatio),
            };
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
