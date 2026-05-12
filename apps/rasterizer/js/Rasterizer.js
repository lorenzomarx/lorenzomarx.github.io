/*
 * Rasterizer — image + live camera rasterization
 * Styles: dots, squares, horiz, diag, ascii
 */

const Rasterizer = {
    state: {
        source: 'image',     // 'image' | 'camera'
        style: 'dots',       // 'dots' | 'squares' | 'horiz' | 'diag' | 'ascii'
        intensity: 1,
        invert: false,
        useColors: false,
    },

    // Cell metrics — ASCII uses rectangular cells matching Courier aspect
    cellSize: 10,
    asciiCellW: 8,
    asciiCellH: 14,
    asciiChars: ' .,:;-=+*#%@',

    // DOM refs
    canvas: null, ctx: null,
    buffer: null, bufferCtx: null,
    video: null, fileInput: null,
    emptyEl: null, statusEl: null,

    // Media
    image: null,
    stream: null,
    rafId: null,

    init() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.video = document.getElementById('video');
        this.fileInput = document.getElementById('file-input');
        this.emptyEl = document.getElementById('empty');
        this.emptyText = document.getElementById('empty-text');
        this.enableCameraBtn = document.getElementById('enable-camera');
        this.statusEl = document.getElementById('status');

        this.buffer = document.createElement('canvas');
        this.bufferCtx = this.buffer.getContext('2d', { willReadFrequently: true });

        this.canvas.style.display = 'none';
        this.bindUI();
    },

    bindUI() {
        document.getElementById('source-bar').addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn) return;
            this.setActive('source-bar', btn);
            this.setSource(btn.dataset.source);
        });

        document.getElementById('style-bar').addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn) return;
            this.setActive('style-bar', btn);
            this.setStyle(btn.dataset.style);
        });

        const slider = document.getElementById('intensity');
        const sliderVal = document.getElementById('intensity-value');
        slider.addEventListener('input', () => {
            this.state.intensity = parseFloat(slider.value);
            sliderVal.textContent = this.state.intensity.toFixed(1);
            if (this.state.source === 'image') this.render();
        });

        document.getElementById('invert').addEventListener('click', e => {
            this.state.invert = !this.state.invert;
            e.currentTarget.classList.toggle('on');
            if (this.state.source === 'image') this.render();
        });

        document.getElementById('colors').addEventListener('click', e => {
            this.state.useColors = !this.state.useColors;
            e.currentTarget.classList.toggle('on');
            if (this.state.source === 'image') this.render();
        });

        document.getElementById('upload').addEventListener('click', () => {
            if (this.state.source === 'camera') {
                this.setActive('source-bar', document.querySelector('[data-source="image"]'));
                this.setSource('image');
            }
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) this.loadImage(file);
            this.fileInput.value = '';
        });

        document.getElementById('save').addEventListener('click', () => this.save());

        this.enableCameraBtn.addEventListener('click', () => this.startCamera());

        window.addEventListener('resize', this.debounce(() => {
            if (this.state.source === 'image' && this.image) this.render();
        }, 150));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.rafId !== null) {
                    cancelAnimationFrame(this.rafId);
                    this.rafId = null;
                }
            } else if (this.state.source === 'camera' && this.stream) {
                this.tick();
            }
        });
    },

    setActive(barId, target) {
        document.querySelectorAll(`#${barId} button`).forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        target.classList.add('active');
        target.setAttribute('aria-pressed', 'true');
    },

    setStyle(style) {
        this.state.style = style;
        if (this.state.source === 'image' && this.image) this.render();
    },

    setSource(source) {
        if (this.state.source === source) return;
        this.state.source = source;
        this.stopCamera();
        if (source === 'camera') {
            // Fire getUserMedia synchronously from the tab click — this preserves
            // the user-gesture chain Safari/iOS requires. Permission prompt opens
            // on the first tap.
            this.showCameraPrompt('Starting camera…');
            this.startCamera();
        } else {
            this.hideCameraPrompt();
            if (this.image) {
                this.showCanvas();
                this.render();
            } else {
                this.showEmpty();
            }
        }
    },

    showCameraPrompt(text) {
        this.canvas.style.display = 'none';
        this.emptyEl.style.display = 'flex';
        this.emptyEl.classList.add('camera-mode');
        this.emptyText.innerHTML = text || 'Camera mode';
    },

    hideCameraPrompt() {
        this.emptyEl.classList.remove('camera-mode');
        this.emptyText.innerHTML = 'Upload an image<br>or start the camera';
    },

    cameraFailure(msg) {
        this.setStatus(msg, true);
        this.showCameraPrompt(msg);
        this.stream = null;
        this.video.srcObject = null;
    },

    async startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.cameraFailure('Camera API not available in this browser.');
            return;
        }
        if (!window.isSecureContext) {
            this.cameraFailure('Camera needs HTTPS. Open the deployed site (lorenzomarx.github.io) or use an HTTPS tunnel.');
            return;
        }
        this.setStatus('Requesting camera…');
        this.enableCameraBtn.disabled = true;
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                },
                audio: false,
            });
            this.video.srcObject = this.stream;
            await this.video.play();
            this.clearStatus();
            this.hideCameraPrompt();
            this.showCanvas();
            this.tick();
        } catch (err) {
            console.error('Camera error:', err);
            const msg =
                err.name === 'NotAllowedError'  ? 'Camera blocked. Allow access in your browser permissions, then tap "Retry".' :
                err.name === 'NotFoundError'    ? 'No camera found on this device.' :
                err.name === 'NotReadableError' ? 'Camera is in use by another app.' :
                err.name === 'SecurityError'    ? 'Blocked by browser security policy. Open the deployed HTTPS site.' :
                `Camera error: ${err.message || err.name || 'unknown'}`;
            this.cameraFailure(msg);
        } finally {
            this.enableCameraBtn.disabled = false;
        }
    },

    stopCamera() {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        this.video.srcObject = null;
        this.clearStatus();
    },

    loadImage(file) {
        const img = new Image();
        img.onload = () => {
            if (this.image && this.image.src.startsWith('blob:')) {
                URL.revokeObjectURL(this.image.src);
            }
            this.image = img;
            this.showCanvas();
            this.render();
        };
        img.onerror = () => this.setStatus('Could not load that image.', true);
        img.src = URL.createObjectURL(file);
    },

    showCanvas() {
        this.canvas.style.display = 'block';
        this.emptyEl.style.display = 'none';
    },

    showEmpty(text) {
        if (text) this.emptyEl.innerHTML = text;
        this.canvas.style.display = 'none';
        this.emptyEl.style.display = 'block';
    },

    setStatus(text, isError) {
        this.statusEl.textContent = text;
        this.statusEl.classList.add('show');
        this.statusEl.classList.toggle('error', !!isError);
    },

    clearStatus() {
        this.statusEl.classList.remove('show', 'error');
        this.statusEl.textContent = '';
    },

    tick() {
        if (this.state.source !== 'camera' || !this.stream) return;
        if (this.video.readyState >= 2 && this.video.videoWidth) {
            this.renderFrame(this.video);
        }
        this.rafId = requestAnimationFrame(() => this.tick());
    },

    render() {
        if (this.state.source === 'camera') return; // handled by tick()
        if (!this.image) return;
        this.renderFrame(this.image);
    },

    renderFrame(source) {
        const isVideo = source.tagName === 'VIDEO';
        const srcW = isVideo ? source.videoWidth : source.naturalWidth;
        const srcH = isVideo ? source.videoHeight : source.naturalHeight;
        if (!srcW || !srcH) return;

        const isAscii = this.state.style === 'ascii';
        const cellW = isAscii ? this.asciiCellW : this.cellSize;
        const cellH = isAscii ? this.asciiCellH : this.cellSize;

        // Fit canvas within viewport
        const maxW = Math.min(window.innerWidth - 64, 900);
        const scale = Math.min(1, maxW / srcW);
        const gridW = Math.max(1, Math.floor(srcW * scale / cellW));
        const gridH = Math.max(1, Math.floor(srcH * scale / cellH));
        const dispW = gridW * cellW;
        const dispH = gridH * cellH;

        if (this.canvas.width !== dispW || this.canvas.height !== dispH) {
            this.canvas.width = dispW;
            this.canvas.height = dispH;
        }
        if (this.buffer.width !== gridW || this.buffer.height !== gridH) {
            this.buffer.width = gridW;
            this.buffer.height = gridH;
        }

        this.bufferCtx.drawImage(source, 0, 0, gridW, gridH);
        const imgData = this.bufferCtx.getImageData(0, 0, gridW, gridH);
        const data = imgData.data;

        const cellCount = gridW * gridH;
        const brightness = new Float32Array(cellCount);
        const colors = this.state.useColors ? new Array(cellCount) : null;
        const invert = this.state.invert;
        for (let i = 0; i < cellCount; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            let bri = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            if (invert) bri = 1 - bri;
            brightness[i] = bri;
            if (colors) colors[i] = `rgb(${r},${g},${b})`;
        }

        const ctx = this.ctx;
        ctx.fillStyle = '#FDF2F8';
        ctx.fillRect(0, 0, dispW, dispH);

        const fg = '#0A0A0A';
        switch (this.state.style) {
            case 'dots':    this.renderDots(brightness, colors, gridW, gridH, cellW, cellH, fg); break;
            case 'squares': this.renderSquares(brightness, colors, gridW, gridH, cellW, cellH, fg); break;
            case 'horiz':   this.renderHoriz(brightness, colors, gridW, gridH, cellW, cellH, fg); break;
            case 'diag':    this.renderDiag(brightness, colors, gridW, gridH, cellW, cellH, fg); break;
            case 'ascii':   this.renderAscii(brightness, colors, gridW, gridH, cellW, cellH, fg); break;
        }
    },

    renderDots(brightness, colors, gridW, gridH, cellW, cellH, fg) {
        const ctx = this.ctx;
        const maxR = Math.min(cellW, cellH) * 0.45 * this.state.intensity;
        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const i = y * gridW + x;
                const r = brightness[i] * maxR;
                if (r < 0.4) continue;
                ctx.fillStyle = colors ? colors[i] : fg;
                ctx.beginPath();
                ctx.arc(x * cellW + cellW / 2, y * cellH + cellH / 2, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    renderSquares(brightness, colors, gridW, gridH, cellW, cellH, fg) {
        const ctx = this.ctx;
        const scale = this.state.intensity;
        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const i = y * gridW + x;
                const bri = brightness[i];
                const sw = Math.min(cellW, bri * cellW * scale);
                const sh = Math.min(cellH, bri * cellH * scale);
                if (sw < 0.5 || sh < 0.5) continue;
                ctx.fillStyle = colors ? colors[i] : fg;
                ctx.fillRect(
                    x * cellW + (cellW - sw) / 2,
                    y * cellH + (cellH - sh) / 2,
                    sw, sh
                );
            }
        }
    },

    renderHoriz(brightness, colors, gridW, gridH, cellW, cellH, fg) {
        const ctx = this.ctx;
        const scale = this.state.intensity;
        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const i = y * gridW + x;
                const t = Math.min(cellH, brightness[i] * cellH * scale);
                if (t < 0.4) continue;
                ctx.fillStyle = colors ? colors[i] : fg;
                ctx.fillRect(x * cellW, y * cellH + (cellH - t) / 2, cellW, t);
            }
        }
    },

    renderDiag(brightness, colors, gridW, gridH, cellW, cellH, fg) {
        const ctx = this.ctx;
        ctx.lineCap = 'butt';
        const scale = this.state.intensity;
        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const i = y * gridW + x;
                const t = brightness[i] * Math.min(cellW, cellH) * 0.7 * scale;
                if (t < 0.5) continue;
                ctx.strokeStyle = colors ? colors[i] : fg;
                ctx.lineWidth = t;
                ctx.beginPath();
                ctx.moveTo(x * cellW, y * cellH + cellH);
                ctx.lineTo(x * cellW + cellW, y * cellH);
                ctx.stroke();
            }
        }
    },

    renderAscii(brightness, colors, gridW, gridH, cellW, cellH, fg) {
        const ctx = this.ctx;
        const chars = this.asciiChars;
        const lastIdx = chars.length - 1;
        const scale = this.state.intensity;
        ctx.font = `${cellH}px "Courier New", Courier, monospace`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        for (let y = 0; y < gridH; y++) {
            for (let x = 0; x < gridW; x++) {
                const i = y * gridW + x;
                let bri = brightness[i] * scale;
                if (bri > 1) bri = 1;
                let idx = Math.floor(bri * lastIdx);
                if (idx < 0) idx = 0;
                if (idx > lastIdx) idx = lastIdx;
                ctx.fillStyle = colors ? colors[i] : fg;
                ctx.fillText(chars[idx], x * cellW, y * cellH);
            }
        }
    },

    save() {
        try {
            const link = document.createElement('a');
            link.download = `rasterizer-${Date.now()}.png`;
            link.href = this.canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            this.setStatus('Save failed: ' + err.message, true);
        }
    },

    debounce(fn, ms) {
        let id;
        return (...args) => {
            clearTimeout(id);
            id = setTimeout(() => fn.apply(this, args), ms);
        };
    },
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Rasterizer.init());
} else {
    Rasterizer.init();
}
