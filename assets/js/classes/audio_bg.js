class StarField {
    constructor(canvas = document.querySelector('canvas'), starsAmount = 100, depth = 5000) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.starsAmount = starsAmount;
        this.depth = depth;
        this.canvas.height = innerHeight;
        this.canvas.width = innerWidth;
        this.isActive = false;
        this.colors = ['#fff', '#e63410', '#fcc347', '#1e99e6'];
        this.fov = (this.canvas.height + this.canvas.width) / 2;
        this.stars = [];
        for (let i = 0; i < this.starsAmount; i++) this.stars.push(new Star(this.ctx, this.random(0, this.canvas.width), this.random(0, this.canvas.height), i * (this.depth / this.starsAmount), this.colors[this.random(0, 3)]));
        this.animate(true);
    }
    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    stop() {
        if (!this.isActive) return;
        cancelAnimationFrame(this.animationFrame);
        this.isActive = false;
    }
    animate(setup) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stars.forEach(s => {
            s.z = s.z - 5 < 0 ? this.depth : s.z - 10;
            const t_x = this.canvas.width / 2,
                t_y = this.canvas.height / 2,
                s_x = (s.x - t_x) / (s.z / this.fov) + t_x,
                s_y = (s.y - t_y) / (s.z / this.fov) + t_y;
            s.draw(s_x, s_y, s.size * this.fov / (this.fov + s.z));
        })
        if (!setup) this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    resize() {
        this.canvas.height = innerHeight;
        this.canvas.width = innerWidth;
        this.fov = (this.canvas.height + this.canvas.width) / 2;
        this.stars = [];
        for (let i = 0; i < this.starsAmount; i++) this.stars.push(new Star(this.ctx, this.random(0, this.canvas.width), this.random(0, this.canvas.height), i * (this.depth / this.starsAmount), this.colors[this.random(0, 3)]));
        if (!this.isActive) this.animate(true);
    }
}
class Star {
    constructor(ctx, x, y, z, color) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.z = z;
        this.size = 5;
        this.color = color;
    }
    draw(x, y, size) {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(x, y, size, size);
    }
}