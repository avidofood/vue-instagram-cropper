/* eslint-disable prefer-destructuring */
import u from '../core/util';
import * as Settings from '../core/const';

export default {
    methods: {
        emitNativeEvent(evt) {
            this.emitEvent(evt.type, evt);
        },

        $_c_handlePointerStart(evt) {
            this.emitNativeEvent(evt);

            this.supportTouch = true;
            this.pointerMoved = false;
            const pointerCoord = u.getPointerCoords(evt, this);
            this.pointerStartCoord = pointerCoord;

            // simulate click with touch on mobile devices
            if (!this.hasImage()) {
                this.tabStart = new Date().valueOf();
                return;
            }
            // ignore mouse right click and middle click
            if (evt.which && evt.which > 1) return;
            if (!evt.touches || evt.touches.length === 1) {
                this.dragging = true;
                this.pinching = false;
                const coord = u.getPointerCoords(evt, this);
                this.lastMovingCoord = coord;
            }
            if (evt.touches && evt.touches.length === 2) {
                this.dragging = false;
                this.pinching = true;
                this.pinchDistance = u.getPinchDistance(evt, this);
            }
            const cancelEvents = ['mouseup', 'touchend', 'touchcancel', 'pointerend', 'pointercancel'];

            for (let i = 0, len = cancelEvents.length; i < len; i += 1) {
                const e = cancelEvents[i];
                document.addEventListener(e, this.$_c_handlePointerEnd);
            }
        },

        $_c_handlePointerEnd(evt) {
            this.emitNativeEvent(evt);

            let pointerMoveDistance = 0;
            if (this.pointerStartCoord) {
                const pointerCoord = u.getPointerCoords(evt, this);
                pointerMoveDistance = Math.sqrt(Math.pow(pointerCoord.x - this.pointerStartCoord.x, 2) + Math.pow(pointerCoord.y - this.pointerStartCoord.y, 2)) || 0;
            }

            if (!this.hasImage()) {
                const tabEnd = new Date().valueOf();
                if (
                    (pointerMoveDistance < Settings.CLICK_MOVE_THRESHOLD)
                    && tabEnd - this.tabStart < Settings.MIN_MS_PER_CLICK && this.supportTouch
                ) {
                    this.chooseFile();
                }
                this.tabStart = 0;
                return;
            }

            this.$_c_checkBounceness();

            this.dragging = false;
            this.pinching = false;
            this.pinchDistance = 0;
            this.lastMovingCoord = null;
            this.pointerMoved = false;
            this.pointerStartCoord = null;
        },

        $_c_handlePointerMove(evt) {
            this.emitNativeEvent(evt);

            this.pointerMoved = true;
            if (!this.hasImage()) return;
            const coord = u.getPointerCoords(evt, this);
            this.currentPointerCoord = coord;

            evt.preventDefault();

            if (!evt.touches || evt.touches.length === 1) {
                if (!this.dragging) return;
                if (this.lastMovingCoord) {
                    this.move({
                        x: coord.x - this.lastMovingCoord.x,
                        y: coord.y - this.lastMovingCoord.y,
                    });
                }
                this.lastMovingCoord = coord;
            }
            if (evt.touches && evt.touches.length === 2) {
                if (!this.pinching) return;
                const distance = u.getPinchDistance(evt, this);
                const delta = distance - this.pinchDistance;
                this.zoom(delta > 0, Settings.PINCH_ACCELERATION);
                this.pinchDistance = distance;

                this.$nextTick(() => {
                    this.$_c_handleZoomWheel();
                });
            }
        },

        $_c_handlePointerLeave(evt) {
            this.emitNativeEvent(evt);

            this.currentPointerCoord = null;
        },

        $_c_handleWheel(evt) {
            this.emitNativeEvent(evt);

            if (!this.hasImage()) return;

            evt.preventDefault();
            this.scrolling = true;

            if (evt.wheelDelta < 0 || evt.deltaY > 0 || evt.detail > 0) {
                this.zoom(false);
            } else if (evt.wheelDelta > 0 || evt.deltaY < 0 || evt.detail < 0) {
                this.zoom(true);
            }

            this.$nextTick(() => {
                this.$_c_handleZoomWheel();
                this.scrolling = false;
            });
        },

        $_c_handleDragEnter(evt) {
            this.emitNativeEvent(evt);

            if (!u.eventHasFile(evt)) return;

            if (this.hasImage()) return;

            this.fileDraggedOver = true;
        },

        $_c_handleDragLeave(evt) {
            this.emitNativeEvent(evt);

            if (!this.fileDraggedOver || !u.eventHasFile(evt)) return;

            this.fileDraggedOver = false;
        },

        $_c_handleDragOver(evt) {
            this.emitNativeEvent(evt);
        },

        $_c_handleDrop(evt) {
            this.emitNativeEvent(evt);

            if (!this.fileDraggedOver || !u.eventHasFile(evt)) return;

            if (this.hasImage()) {
                return;
            }
            this.fileDraggedOver = false;
            let file;
            const dt = evt.dataTransfer;

            if (!dt) return;

            if (dt.items) {
                for (let i = 0, len = dt.items.length; i < len; i += 1) {
                    const item = dt.items[i];
                    if (item.kind === 'file') {
                        file = item.getAsFile();
                        break;
                    }
                }
            } else {
                file = dt.files[0];
            }
            if (file) {
                this.$_c_onNewFileIn(file);
            }
        },
        $_c_handleClick(evt) {
            this.emitNativeEvent(evt);
            if (!this.hasImage() && !this.supportTouch) {
                this.chooseFile();
            }
        },
        $_c_handleDblClick(evt) {
            this.emitNativeEvent(evt);
        },
        $_c_handleInputChange() {
            const input = this.$refs.fileInput;
            if (!input.files.length) return;
            const file = input.files[0];
            this.$_c_onNewFileIn(file);
        },
    },
};
