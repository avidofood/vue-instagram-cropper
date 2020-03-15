/**
 * The goal is, just to save the image on the canvas and not the rest what might be seen.
 */
/**
     * Remember: we don't need to set the quality, since imgData, and output
     * has already calculated it in croppa
     */

export default class Saving {
    constructor(img, imgData, outputWidth, outputHeight) {
        this.img = img;
        this.imgData = imgData;
        this.outputWidth = outputWidth;
        this.outputHeight = outputHeight;

        this.canvas = null;
        this.ctx = null;
    }

    generateDataUrl(type, compressionRate) {
        this.createCanvas();
        const result = this.canvas.toDataURL(type, compressionRate);
        this.beforeDestroy();

        return result;
    }

    generateBlob(callback, mimeType, qualityArgument) {
        this.createCanvas();
        this.canvas.toBlob(callback, mimeType, qualityArgument);
        this.beforeDestroy();
    }

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
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.drawImageOnCanvas();
    }

    drawImageOnCanvas() {
        const { width, height } = this.imgData;

        this.calculateCanvasDimension(width, height);

        const { startX, startY } = this.getXYPosition();

        // ctx.drawImage(image, dx, dy, dWidth, dHeight);
        this.ctx.drawImage(this.img, startX, startY, width, height);
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
