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

// Specifies how fast the zoom is reacting to scroll gestures. Default to level 3.
export const ZOOM_SPEED = 3;

export const MAXIMUM_ASPECT_RATIO = 1.91 / 1;
export const MINIMUM_ASPECT_RATIO = 4 / 5;
