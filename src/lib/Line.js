// https://stackoverflow.com/questions/19966912/drawing-over-an-image-in-html5-canvas-while-preserving-the-image

export default class Line {
    constructor(ctx) {
        this.ctx = ctx;
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x1, this.y1);
        this.ctx.lineTo(this.x2, this.y2);
        this.ctx.stroke();
    }
}
