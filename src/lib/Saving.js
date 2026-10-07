/**
 * The goal is, just to save the image on the canvas and not the rest what might be seen.
 */
/**
     * Remember: we don't need to set the quality, since imgData, and output
     * has already calculated it in croppa
     */

// Only a positive number counts. Anything else leaves the option out.
const positive = (value) => (typeof value === 'number' && value > 0 ? value : 0);

/**
 * The factor from the visible size to the output size. width or height sets that side. With
 * both, the output fits into width x height. maxWidth and maxHeight only make it smaller.
 */
export function outputScale(visibleWidth, visibleHeight, options = {}) {
    if (!visibleWidth || !visibleHeight) return 1;

    const width = positive(options.width);
    const height = positive(options.height);
    const maxWidth = positive(options.maxWidth);
    const maxHeight = positive(options.maxHeight);
    let scale = 1;

    if (width && height) {
        scale = Math.min(width / visibleWidth, height / visibleHeight);
    } else if (width) {
        scale = width / visibleWidth;
    } else if (height) {
        scale = height / visibleHeight;
    }
    if (maxWidth && visibleWidth * scale > maxWidth) scale = maxWidth / visibleWidth;
    if (maxHeight && visibleHeight * scale > maxHeight) scale = maxHeight / visibleHeight;

    return scale;
}

export default class Saving {
    constructor(img, imgData, outputWidth, outputHeight) {
        this.img = img;
        this.imgData = imgData;
        this.outputWidth = outputWidth;
        this.outputHeight = outputHeight;

        this.canvas = null;
        this.ctx = null;
    }

    generateDataUrl(type, compressionRate, options) {
        this.createCanvas(options);
        const result = this.canvas.toDataURL(type, compressionRate);
        this.beforeDestroy();

        return result;
    }

    generateBlob(callback, mimeType, qualityArgument, options) {
        this.createCanvas(options);
        this.canvas.toBlob(callback, mimeType, qualityArgument);
        this.beforeDestroy();
    }

    promisedBlob(...args) {
        return new Promise((resolve, reject) => {
            try {
                this.generateBlob((blob) => {
                    resolve(blob);
                }, ...args);
            } catch (err) {
                reject(err);
            }
        });
    }

    createCanvas(options) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.drawImageOnCanvas(options);
    }

    drawImageOnCanvas(options) {
        const { width, height } = this.imgData;

        this.calculateCanvasDimension(width, height);

        // The canvas has the visible size now. The options can scale it.
        const scale = outputScale(this.canvas.width, this.canvas.height, options);
        if (scale !== 1) {
            this.canvas.width = Math.max(1, Math.round(this.canvas.width * scale));
            this.canvas.height = Math.max(1, Math.round(this.canvas.height * scale));
        }

        const { startX, startY } = this.getXYPosition();

        // ctx.drawImage(image, dx, dy, dWidth, dHeight);
        this.ctx.drawImage(this.img, startX * scale, startY * scale, width * scale, height * scale);
    }

    getXYPosition() {
        return {
            startX: this.imgData.startX > 0 ? 0 : this.imgData.startX,
            startY: this.imgData.startY > 0 ? 0 : this.imgData.startY,
        };
    }

    calculateCanvasDimension(imgWidth, imgHeight) {
        this.canvas.width = imgWidth > this.outputWidth ? this.outputWidth : imgWidth;
        this.canvas.height = imgHeight > this.outputHeight ? this.outputHeight : imgHeight;
    }

    beforeDestroy() {
        this.canvas = null;
        this.ctx = null;
    }
}
