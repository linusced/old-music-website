class Slider {
    constructor(sliderElement = document.querySelector(null), min = 0, max = 1, value = 0, length_px = 100, isVertical = false, sliderBgElement = null) {
        this.container = sliderElement;
        this.sliderBgElement = sliderBgElement;
        this.container_length = length_px;
        this.track_length = this.container_length - 24;
        this.isVertical = isVertical;
        this.container.classList.add('slider-container');
        if (this.isVertical) this.container.style.height = this.container_length + 'px';
        else this.container.style.width = this.container_length + 'px';
        this.container.innerHTML = `<div class="slider-track" style="${this.isVertical ? 'height:' + this.track_length : 'width:' + this.track_length}px"><div class="slider-thumb ${this.isVertical ? 'slider-vertical' : 'slider-horizontal'}"><span></span></div></div>`;
        this.track = this.container.querySelector('.slider-track');
        this.thumb = this.container.querySelector('.slider-thumb');
        this.mouseMoveElement = document.createElement('div');
        this.mouseMoveElement.className = 'slider-mousemove';
        this.min = min;
        this.max = max;
        this.value = value;
        this.onInput = this.onChange = this.bgElementTimeout = null;
        this.mouseDown = false;
        this.update();
        this.container.addEventListener('mousedown', e => this.mouseStart(e));
        document.body.addEventListener('mousemove', e => this.mouseDown ? this.mouseEvent(e) : null);
        document.body.addEventListener('mouseup', () => this.mouseDown ? this.mouseStop() : null);
        document.body.addEventListener('mouseleave', () => this.mouseDown ? this.mouseStop() : null);
        if ('ontouchstart' in window) {
            this.container.addEventListener('touchstart', e => this.mouseStart(e), { passive: true });
            document.body.addEventListener('touchmove', e => this.mouseDown ? this.mouseEvent(e) : null);
            document.body.addEventListener('touchend', () => this.mouseDown ? this.mouseStop() : null);
            document.body.addEventListener('touchcancel', () => this.mouseDown ? this.mouseStop() : null);
        }
    }
    setLength(length_px) {
        this.container_length = length_px;
        this.track_length = this.container_length - 24;
        if (this.isVertical) {
            this.container.style.height = this.container_length + 'px';
            this.track.style.height = this.track_length + 'px';
        } else {
            this.container.style.width = this.container_length + 'px';
            this.track.style.width = this.track_length + 'px';
        }
    }
    update(changeBgElement) {
        if (changeBgElement && this.sliderBgElement) this.sliderBgElement.classList.add('active');
        const style = (((this.value / (this.max - this.min)) - (this.min / (this.max - this.min))) * 100).toFixed(2) + '%';
        if (this.isVertical) this.thumb.style.height = style;
        else this.thumb.style.width = style;
        if (changeBgElement && this.sliderBgElement) {
            if (this.bgElementTimeout) clearTimeout(this.bgElementTimeout);
            this.bgElementTimeout = setTimeout(() => this.sliderBgElement.classList.remove('active'), 500);
        }
    }
    addEventListener(type, listener) {
        switch (type) {
            case 'input':
                this.onInput = listener;
                break;
            case 'change':
                this.onChange = listener;
                break;
        }
    }
    getValue_for_x(x) {
        return (x * (this.max - this.min) / this.track_length) + this.min;
    }
    mouseStart(e) {
        this.mouseDown = true;
        if (!document.querySelector('.slider-mousemove')) document.body.appendChild(this.mouseMoveElement);
        this.container.classList.add('active');
        if (this.sliderBgElement) this.sliderBgElement.classList.add('active');
        this.mouseEvent(e);
    }
    mouseEvent(e) {
        const rect = this.track.getBoundingClientRect();
        if (this.isVertical) {
            var x = rect.bottom - (e.constructor.name === 'TouchEvent' ? e.touches[0].pageY : e.pageY);
            if (x > rect.height) x = rect.height;
            else if (x < 0) x = 0;
        } else {
            var x = (e.constructor.name === 'TouchEvent' ? e.touches[0].pageX : e.pageX) - rect.left;
            if (x > rect.width) x = rect.width;
            else if (x < 0) x = 0;
        }
        this.value = this.getValue_for_x(x);
        this.update();
        if (this.onInput) this.onInput(this.value);
    }
    mouseStop() {
        this.mouseDown = false
        if (document.querySelector('.slider-mousemove')) document.body.removeChild(this.mouseMoveElement);
        this.container.classList.remove('active');
        if (this.onChange) this.onChange(this.value);
        if (this.sliderBgElement) {
            if (this.bgElementTimeout) clearTimeout(this.bgElementTimeout);
            this.bgElementTimeout = setTimeout(() => this.sliderBgElement.classList.remove('active'), 500);
        }
    }
}