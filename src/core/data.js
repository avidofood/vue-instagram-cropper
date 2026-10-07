// A function, so that every cropper gets its own state
export default () => ({
    canvas: null,
    ctx: null,
    img: null,
    line: null,

    imgData: {
        width: 0,
        height: 0,
        startX: 0,
        startY: 0,
    },

    naturalWidth: 0,
    naturalHeight: 0,
    scaleRatio: null,
    // unfortunately a stupid bug
    // if I use e.g. aspectFill, it
    // activates the scaleRatio and changes the
    // image position.
    skipScaleRatio: false,

    imageSet: false,

    loading: false,
    // only for when autoSizing is on
    realWidth: 0,
    realHeight: 0,
    chosenFile: null,

    // used in handle mixins
    supportTouch: false,
    pointerMoved: false,
    pointerStartCoord: null,
    tabStart: 0,
    dragging: false,
    pinching: false,
    lastMovingCoord: null,
    pinchDistance: 0,
    currentPointerCoord: null,
    // true for a moment after the last zoom step, so the grid shows while the user zooms
    zooming: false,
    fileDraggedOver: false,

    // used in fileinput.js for the input field
    currentIsInitial: false,

    // functions from addClipPlugin()
    clipPlugins: null,
});
