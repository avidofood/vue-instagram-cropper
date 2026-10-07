// The amount of zooming everytime it happens, in percentage of image width.
export const PCT_PER_ZOOM = 1 / 100000;
// If touch duration is shorter than the value, then it is considered as a click.
export const MIN_MS_PER_CLICK = 500;
// If touch move distance is greater than this value, it is never considered as a click.
export const CLICK_MOVE_THRESHOLD = 100;
// The minimal width the user can zoom to.
export const MIN_WIDTH = 10;
// Placeholder text by default takes up this amount of times of canvas width.
export const DEFAULT_PLACEHOLDER_TAKEUP = 2 / 3;
// The amount of times by which the pinching is more sensitive than the scolling
export const PINCH_ACCELERATION = 2;

// How long the grid stays visible after the last zoom step or key press, in milliseconds
export const GRID_DURATION = 500;

// An arrow key moves the image by this many pixels of the container, with Shift by the second
export const KEYBOARD_STEP = 10;
export const KEYBOARD_STEP_LARGE = 50;
// A plus or minus key zooms like this many wheel steps
export const KEYBOARD_ZOOM_ACCELERATION = 5;

// The texts for screen readers. The prop labels can replace each of them.
export const DEFAULT_LABELS = {
    canvas: 'Image cropper. Press Enter to choose an image. '
        + 'Arrow keys move the image, plus and minus zoom it.',
    remove: 'Remove image',
    fullscreen: 'Fit or fill the image',
};

// Specifies how fast the zoom is reacting to scroll gestures. Default to level 3.
export const ZOOM_SPEED = 3;

export const MAXIMUM_ASPECT_RATIO = 1.91 / 1;
export const MINIMUM_ASPECT_RATIO = 4 / 5;
