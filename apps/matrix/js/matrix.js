/*
 * Matrix — pentatonic step sequencer.
 * Vanilla JS + Web Audio. No external dependencies.
 */

(() => {
    const COLS = 16;
    const ROWS = 16;
    const CELL = 40;  // canvas pixels per cell (internal resolution)

    // C major pentatonic, descending from row 0 (top, highest) to row 15 (bottom, lowest).
    // C6 A5 G5 E5 D5 / C5 A4 G4 E4 D4 / C4 A3 G3 E3 D3 / C3
    const FREQS = [
        1046.50,  880.00,  783.99,  659.25,  587.33,
         523.25,  440.00,  392.00,  329.63,  293.66,
         261.63,  220.00,  196.00,  164.81,  146.83,
         130.81,
    ];

    const COLORS = {
        bg: '#FDF2F8',
        grid: '#0A0A0A',
        cellOn: '#EC4899',
        cellOnPlayhead: '#06B6D4',
        playheadCol: 'rgba(6, 182, 212, 0.18)',
    };

    let grid = makeGrid();
    let bpm = 120;
    let isPlaying = false;
    let playheadCol = -1;

    // Audio
    let audioCtx = null;
    let schedulerId = null;
    let nextStepTime = 0;
    let currentStep = 0;
    const pendingUIUpdates = [];

    // Drag
    let isDragging = false;
    let dragValue = false;
    let lastCell = null;

    // DOM
    let canvasEl, ctx2d;
    let playBtn, clearBtn, shareBtn, bpmSlider, bpmVal, statusEl;

    function makeGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    }

    function init() {
        canvasEl = document.getElementById('grid');
        ctx2d   = canvasEl.getContext('2d');
        playBtn  = document.getElementById('play');
        clearBtn = document.getElementById('clear');
        shareBtn = document.getElementById('share');
        bpmSlider = document.getElementById('bpm');
        bpmVal    = document.getElementById('bpm-val');
        statusEl  = document.getElementById('status');

        canvasEl.width  = COLS * CELL;
        canvasEl.height = ROWS * CELL;

        loadFromHash();
        bind();
        draw();
    }

    function loadFromHash() {
        if (window.location.hash.length <= 1) return;
        const decoded = decodeGrid(window.location.hash.slice(1));
        if (decoded) grid = decoded;
    }

    function bind() {
        canvasEl.addEventListener('pointerdown', onPointerDown);
        canvasEl.addEventListener('pointermove', onPointerMove);
        canvasEl.addEventListener('pointerup',     endDrag);
        canvasEl.addEventListener('pointercancel', endDrag);
        canvasEl.addEventListener('pointerleave',  endDrag);
        canvasEl.addEventListener('contextmenu', e => e.preventDefault());

        playBtn.addEventListener('click', togglePlay);
        clearBtn.addEventListener('click', () => {
            grid = makeGrid();
            updateHash();
            draw();
        });
        shareBtn.addEventListener('click', share);
        bpmSlider.addEventListener('input', () => {
            bpm = parseInt(bpmSlider.value, 10) || 120;
            bpmVal.textContent = String(bpm);
        });

        document.getElementById('open-info').addEventListener('click', () => {
            document.getElementById('info-modal').hidden = false;
        });
        document.getElementById('close-info').addEventListener('click', () => {
            document.getElementById('info-modal').hidden = true;
        });
        document.getElementById('info-modal').addEventListener('click', e => {
            if (e.target.id === 'info-modal') e.target.hidden = true;
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') document.getElementById('info-modal').hidden = true;
            if (e.code === 'Space' && !e.target.matches('input,textarea')) {
                e.preventDefault();
                togglePlay();
            }
        });

        window.addEventListener('hashchange', () => {
            const decoded = window.location.hash.length > 1
                ? decodeGrid(window.location.hash.slice(1))
                : null;
            if (decoded) { grid = decoded; draw(); }
        });
    }

    function cellAt(event) {
        const rect = canvasEl.getBoundingClientRect();
        const scaleX = canvasEl.width  / rect.width;
        const scaleY = canvasEl.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top)  * scaleY;
        const col = Math.floor(x / CELL);
        const row = Math.floor(y / CELL);
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
        return { row, col };
    }

    function onPointerDown(e) {
        e.preventDefault();
        try { canvasEl.setPointerCapture(e.pointerId); } catch {}
        const cell = cellAt(e);
        if (!cell) return;
        isDragging = true;
        dragValue = !grid[cell.row][cell.col];
        grid[cell.row][cell.col] = dragValue;
        lastCell = cell;
        draw();
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const cell = cellAt(e);
        if (!cell) return;
        if (lastCell && cell.row === lastCell.row && cell.col === lastCell.col) return;
        grid[cell.row][cell.col] = dragValue;
        lastCell = cell;
        draw();
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        lastCell = null;
        updateHash();
    }

    // ====================== RENDER ======================

    function draw() {
        const w = canvasEl.width;
        const h = canvasEl.height;

        ctx2d.fillStyle = COLORS.bg;
        ctx2d.fillRect(0, 0, w, h);

        if (playheadCol >= 0) {
            ctx2d.fillStyle = COLORS.playheadCol;
            ctx2d.fillRect(playheadCol * CELL, 0, CELL, h);
        }

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (!grid[row][col]) continue;
                ctx2d.fillStyle = (col === playheadCol)
                    ? COLORS.cellOnPlayhead
                    : COLORS.cellOn;
                const pad = 3;
                ctx2d.fillRect(
                    col * CELL + pad,
                    row * CELL + pad,
                    CELL - pad * 2,
                    CELL - pad * 2
                );
            }
        }

        // Light grid lines
        ctx2d.strokeStyle = COLORS.grid;
        ctx2d.lineWidth = 1;
        for (let i = 1; i < COLS; i++) {
            ctx2d.beginPath();
            ctx2d.moveTo(i * CELL, 0);
            ctx2d.lineTo(i * CELL, h);
            ctx2d.stroke();
        }
        for (let i = 1; i < ROWS; i++) {
            ctx2d.beginPath();
            ctx2d.moveTo(0, i * CELL);
            ctx2d.lineTo(w, i * CELL);
            ctx2d.stroke();
        }
        // Beat lines every 4 cols
        ctx2d.lineWidth = 3;
        for (let i = 0; i <= COLS; i += 4) {
            ctx2d.beginPath();
            ctx2d.moveTo(i * CELL, 0);
            ctx2d.lineTo(i * CELL, h);
            ctx2d.stroke();
        }
    }

    // ====================== AUDIO ======================

    function ensureAudio() {
        if (audioCtx) return;
        const Ctor = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctor();
    }

    function playNote(freq, when) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, when);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, when);
        filter.Q.setValueAtTime(1.2, when);

        gain.gain.setValueAtTime(0, when);
        gain.gain.linearRampToValueAtTime(0.18, when + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(when);
        osc.stop(when + 0.5);
    }

    function stepIntervalSec() {
        return 60 / (bpm * 4);  // 16th notes per beat
    }

    function scheduler() {
        const lookahead = 0.1;  // schedule 100ms ahead
        while (nextStepTime < audioCtx.currentTime + lookahead) {
            const stepCol = currentStep % COLS;
            for (let row = 0; row < ROWS; row++) {
                if (grid[row][stepCol]) playNote(FREQS[row], nextStepTime);
            }
            const delayMs = Math.max(0, (nextStepTime - audioCtx.currentTime) * 1000);
            const id = setTimeout(() => {
                playheadCol = stepCol;
                draw();
            }, delayMs);
            pendingUIUpdates.push(id);

            currentStep++;
            nextStepTime += stepIntervalSec();
        }
    }

    function togglePlay() {
        if (isPlaying) stop();
        else start();
    }

    function start() {
        ensureAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        isPlaying = true;
        playBtn.textContent = 'Stop';
        playBtn.classList.add('on');
        nextStepTime = audioCtx.currentTime + 0.05;
        currentStep = 0;
        scheduler();
        schedulerId = setInterval(scheduler, 25);
    }

    function stop() {
        isPlaying = false;
        playBtn.textContent = 'Play';
        playBtn.classList.remove('on');
        if (schedulerId !== null) {
            clearInterval(schedulerId);
            schedulerId = null;
        }
        while (pendingUIUpdates.length) clearTimeout(pendingUIUpdates.pop());
        playheadCol = -1;
        draw();
    }

    // ====================== SHARE ======================

    function encodeGrid() {
        const bytes = new Uint8Array(COLS * 2);
        for (let col = 0; col < COLS; col++) {
            let v = 0;
            for (let row = 0; row < ROWS; row++) {
                if (grid[row][col]) v |= (1 << row);
            }
            bytes[col * 2]     =  v        & 0xff;
            bytes[col * 2 + 1] = (v >> 8)  & 0xff;
        }
        if (bytes.every(b => b === 0)) return '';
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function decodeGrid(str) {
        try {
            let s = str.replace(/-/g, '+').replace(/_/g, '/');
            while (s.length % 4) s += '=';
            const bin = atob(s);
            if (bin.length !== COLS * 2) return null;
            const out = makeGrid();
            for (let col = 0; col < COLS; col++) {
                const v = bin.charCodeAt(col * 2) | (bin.charCodeAt(col * 2 + 1) << 8);
                for (let row = 0; row < ROWS; row++) {
                    out[row][col] = !!(v & (1 << row));
                }
            }
            return out;
        } catch {
            return null;
        }
    }

    function updateHash() {
        const enc = encodeGrid();
        const newUrl = enc
            ? window.location.pathname + window.location.search + '#' + enc
            : window.location.pathname + window.location.search;
        history.replaceState(null, '', newUrl);
    }

    async function share() {
        updateHash();
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            showStatus('URL copied to clipboard');
        } catch {
            showStatus('Pattern in URL — copy from address bar');
        }
    }

    function showStatus(text) {
        statusEl.textContent = text;
        statusEl.classList.add('show');
        clearTimeout(showStatus._t);
        showStatus._t = setTimeout(() => statusEl.classList.remove('show'), 2400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
