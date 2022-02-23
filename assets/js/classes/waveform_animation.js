class WaveformAnimation {
    constructor(canvas = document.querySelector('canvas'), colorAttribute = '') {
        this.canvas = canvas;
        this.canvas.height = 340;
        this.canvas.width = Math.max(screen.width, screen.height);
        this.ctx = this.canvas.getContext('2d');
        this.colorAttribute = colorAttribute;
        this.harmonics = this.createWave('sine');
        this.amplitude = this.offsetX = 0;
        this.v_amplitude = .01;
        this.color = 'hsl(hue, 79%, 44%)';
        this.hue = 241;
        this.waveformPresets = [this.createWave('sine'), this.createWave('random-sine'), this.createWave('saw'), this.createWave('random-saw'), this.createWave('square'), this.createWave('random-square'), this.createWave('triangle'), this.createWave('random-triangle')];
        this.waveformPresets_index = this.random(0, this.waveformPresets.length - 1);
        for (let i = 0; i < 4; i++) this.waveformPresets.push(this.createWave('random' + (i > 1 ? '-2' : '')));
        this.waveformChange = {
            active: null,
            first: true
        };
        this.active = false;
        this.time = Date.now();
        this.animationFrame = null;
        this.checkVisibility();
        addEventListener('scroll', () => this.checkVisibility());
    }
    checkVisibility() {
        const bottom = this.canvas.getBoundingClientRect().bottom;
        if (bottom <= 0 && this.active) {
            cancelAnimationFrame(this.animationFrame);
            this.active = false;
            document.documentElement.style.removeProperty(this.colorAttribute);
        } else if (bottom > 0 && !this.active) this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    animate() {
        this.active = true;
        this.draw();
        document.documentElement.style.setProperty(this.colorAttribute, this.color.replace('hue', Math.floor(this.hue)));
        this.offsetX += 2;
        if (this.offsetX > this.HEIGHT - 10) this.offsetX = 0;
        this.amplitude += this.v_amplitude;
        if (this.amplitude >= .99) this.v_amplitude = -.003;
        else if (this.amplitude <= .5 && this.v_amplitude < 0) this.v_amplitude = .003;
        this.hue += .1;
        if (this.hue >= 360) this.hue = 0;
        if (Date.now() - this.time >= 2000) {
            const waveformChange = this.changeWaveform(this.waveformPresets[this.waveformPresets_index]);
            if (waveformChange) {
                this.waveformPresets_index = this.random(0, this.waveformPresets.length - 1);
                this.time = Date.now();
            }
        }
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    draw() {
        const { harmonics, amplitude, offsetX, color, ctx } = this,
            size = this.HEIGHT - 10, offsetY = size / 2;
        let max = 0, y_array = [];
        for (var x = 0; x < size; x++) {
            let y = 0;
            for (var h = 1; h <= harmonics.length; h++) y += sin(h, h > 1 ? harmonics[h - 1].phase : 0, harmonics[h - 1].amplitude);
            y_array.push(y);
            if (Math.abs(y) > max) max = Math.abs(y);
        }
        const mult = amplitude / max;
        ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        ctx.strokeStyle = color.replace('hue', Math.floor(this.hue));
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (var x = offsetX - size; x < this.WIDTH; x++) {
            const y = y_array[(x + offsetX) % size] * mult;
            if (x === 0) ctx.moveTo(x, y * offsetY + offsetY + 5);
            else ctx.lineTo(x, y * offsetY + offsetY + 5);
        }
        ctx.stroke();
        ctx.closePath();
        function sin(f, p, A) {
            return -Math.sin((Math.PI * 2 * x * (f / size)) + (p * Math.PI * 2)) * A;
        }
    }
    changeWaveform(target) {
        const harmonics = this.harmonics, waveformChange = this.waveformChange;
        if (waveformChange.first && harmonics.length > 1) {
            const last = harmonics.length - 1;
            harmonics[last].amplitude -= .01;
            if (harmonics[last].amplitude <= 0) harmonics.splice(last, 1);
        } else if (waveformChange.first) {
            harmonics[0].amplitude = target[0].amplitude;
            waveformChange.first = false;
        } else {
            if (!waveformChange.active && harmonics.length < target.length) {
                harmonics.push({ phase: target[harmonics.length].phase, amplitude: 0 });
                waveformChange.active = .01;
            } else if (!waveformChange.active) {
                waveformChange.first = true;
                return true;
            }
            const last = harmonics.length - 1;
            if (target[last].amplitude > 0) harmonics[last].amplitude += waveformChange.active;
            if (harmonics[last].amplitude >= target[last].amplitude) {
                waveformChange.active = null;
                harmonics[last].amplitude = target[last].amplitude;
            }
        }
        return false;
    }
    createWave(type) {
        const output = [];
        switch (type) {
            case 'sine':
                add(0, 1);
                break;
            case 'saw':
                for (var h = 1; h <= 50; h++) add(0, 1 / h);
                break;
            case 'square':
                for (var h = 1; h <= 50; h += 2) {
                    add(0, 1 / h);
                    skip();
                }
                break;
            case 'triangle':
                for (var h = 1; h <= 20; h += 2) {
                    add(h % 4 === 3 ? .5 : 0, 1 / h ** 2);
                    skip();
                }
                break;
            case 'random-sine':
                add(0, 1);
                for (var h = 1; h <= 20; h++) {
                    if (this.random(0, 10) === 5) add(this.random(-1, 1, true), this.random(0, .5, true));
                    else skip();
                }
                break;
            case 'random-saw':
                for (var h = 1; h <= 50; h++) add(this.random(-.15, .15, true), 1 / h);
                break
            case 'random-square':
                for (var h = 1; h <= 50; h += 2) {
                    add(this.random(-.15, .15, true), 1 / h);
                    skip();
                }
                break;
            case 'random-triangle':
                for (var h = 1; h <= 20; h += 2) {
                    add((h % 4 === 3 ? .5 : 0) + this.random(-.15, .15, true), 1 / h ** 2);
                    skip();
                }
                break;
            case 'random':
                for (var h = 1; h <= this.random(2, 50); h++) add(this.random(-1, 1, true), this.random(0, 1, true));
                break;
            case 'random-2':
                for (var h = 1; h <= this.random(2, 10); h++) add(this.random(-1, 1, true), this.random(0, 1 / h, true));
                break;
        }
        function add(phase, amplitude) {
            output.push({ phase: phase, amplitude: amplitude });
        }
        function skip() {
            output.push({ phase: 0, amplitude: 0 });
        }
        return output;
    }
    random(min, max, allow_decimals) {
        const value = Math.random() * (max - min) + min;
        if (allow_decimals) return value;
        else return Math.round(value);
    }
    get WIDTH() {
        return this.canvas.width;
    }
    get HEIGHT() {
        return this.canvas.height;
    }
}