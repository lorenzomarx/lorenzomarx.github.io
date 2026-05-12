/*
 * Paint — Stick'em Up
 * p5.js graffiti tool. Tool palette selects an active tool; clicking the canvas
 * applies the tool. Keyboard shortcuts still work for power users.
 */

// State driven from the settings sidebar
var PenSize = 4;
var PenColour = '#ffffff';
var TagColour = '#8f8f8f';
var TagSize = 400;
var Tag = 'Cram';
var Crew = 'Cram';
var CrewStyle = 'paint';
var Style = 'paint';
var opacity = 255;
var r = 0, g = 0, b = 0;
var currentBlend = 'BLEND';
var activeTool = 'pen';

// p5 sketch state
var img;          // train background
var queen, chico, royal, hemi, rua, junglist, oosh;
var images;       // user-uploaded image
var noiseFactor = 0;
var radius = 100;
var totalPoints = 60;
var angle;

let backgrounds = [];
let stickers = [];

let H, W;
let v = [];
var scl = 20;
var z = 0.002;

function preload() {
    img = loadImage('train.png');
    queen    = loadImage('images/kemistry.png');
    chico    = loadImage('images/chicorelli.png');
    royal    = loadImage('images/queen.png');
    hemi     = loadImage('images/hemi.png');
    rua      = loadImage('images/Rua_Kenana_Mihaia.png');
    junglist = loadImage('images/goldie.png');
    oosh     = loadImage('images/oosh_logo.png');
    backgrounds = [junglist];
    stickers    = [queen, hemi, chico];
}

function setup() {
    const canvas = createCanvas(540, 960);
    imageMode(CENTER);
    canvas.parent('myCanvas');
    background(0, 0);

    angle = (2 * Math.PI) / totalPoints;
    H = height / scl;
    W = width / scl;
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const index = i * W + j;
            const a = noise(j / 100, i / 100, z) * TWO_PI * 7;
            v[index] = p5.Vector.fromAngle(a).setMag(1);
        }
    }

    bindUI();
}

function draw() {
    // Pen — continuous draw while mouse held
    if (mouseIsPressed && activeTool === 'pen' && pointerInCanvas()) {
        stroke(PenColour);
        strokeWeight(PenSize);
        line(mouseX, mouseY, pmouseX, pmouseY);
    }

    // Flow — runs every frame while flow tool active OR 'b' key held
    if (activeTool === 'flow' || key === 'b') {
        drawFlow();
    }
}

function drawFlow() {
    for (let i = 0; i < H; i++) {
        for (let j = 0; j < W; j++) {
            const index = i * W + j;
            const y = i * scl;
            const x = j * scl;
            const abc = Math.abs(Math.sin(v[index].heading())) * 5;
            push();
            translate(x + scl / 2, y);
            rotate(v[index].heading());
            noStroke();
            fill(random(255), random(255), random(255), 60);
            beginShape();
            vertex(0, 0);
            vertex(scl - 5, 5 + abc);
            vertex(scl + abc, 0);
            vertex(scl - 5, -5 - abc);
            endShape(CLOSE);
            pop();
            const a = noise(j / 100, i / 100, z) * TWO_PI * 7;
            v[index] = p5.Vector.fromAngle(a);
        }
    }
    z += 0.002;
}

// ====================== TOOL APPLICATION ======================

function pointerInCanvas() {
    return mouseX >= 0 && mouseY >= 0 && mouseX <= width && mouseY <= height;
}

function applyActiveTool() {
    switch (activeTool) {
        case 'tag':        applyTagSolid(); break;
        case 'tag-random': applyTagRandom(); break;
        case 'crew':       applyCrew(); break;
        case 'sticker':    applySticker(); break;
        case 'stamp':      applyStamp(); break;
        case 'blob':       applyBlob(); break;
        case 'outline':    applyOutline(); break;
        case 'bgimg':      applyBgImage(); break;
        case 'bgfill':     applyFillBg(); break;
        // 'pen' and 'flow' run continuously in draw()
    }
}

function applyTagSolid() {
    fill(TagColour);
    noStroke();
    textFont(Style);
    textSize(TagSize);
    textAlign(CENTER);
    text(Tag, mouseX, mouseY);
}

function applyTagRandom() {
    fill(random(255), random(255), random(255), random(255));
    noStroke();
    textFont(Style);
    textSize(TagSize);
    textAlign(CENTER);
    blendMode(MULTIPLY);
    text(Tag, mouseX, mouseY);
    blendMode(BLEND);
}

function applyCrew() {
    fill(random(255), random(255), random(255), random(255));
    noStroke();
    textFont(CrewStyle);
    textSize(TagSize);
    textAlign(CENTER);
    blendMode(MULTIPLY);
    text(Crew, mouseX, mouseY);
    blendMode(BLEND);
}

function applySticker() {
    if (!stickers.length) return;
    imageMode(CENTER);
    image(random(stickers), mouseX, mouseY);
}

function applyStamp() {
    if (!images || !images.width) return;
    imageMode(CENTER);
    image(images, mouseX, mouseY);
}

function applyBgImage() {
    if (!backgrounds.length) return;
    imageMode(CENTER);
    image(random(backgrounds), mouseX, mouseY);
}

function applyFillBg() {
    background(r, g, b, opacity);
}

function applyBlob() {
    fill(r, g, b, opacity);
    noStroke();
    beginShape();
    for (let i = 0; i <= totalPoints; i++) {
        const x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        const y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        curveVertex(x, y);
    }
    endShape(CLOSE);
    noiseFactor += 0.1;
}

function applyOutline() {
    noFill();
    stroke(PenColour);
    strokeWeight(PenSize);
    beginShape();
    for (let i = 0; i <= totalPoints; i++) {
        const x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        const y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        curveVertex(x, y);
    }
    endShape(CLOSE);
    noiseFactor += 0.1;
}

// ====================== EVENTS ======================

function mousePressed() {
    if (!pointerInCanvas()) return;
    // Continuous tools (pen, flow) are handled in draw()
    if (activeTool === 'pen' || activeTool === 'flow') return;
    applyActiveTool();
}

function keyPressed() {
    // Power-user shortcuts — preserve original key bindings
    if (key === '1') { blendMode(BLEND); }
    if (key === '2') { applyCrew(); }
    if (key === '3') { applyTagRandom(); }
    if (key === '4') { applyTagSolid(); }
    if (key === '5') { applyFillBg(); }
    if (key === '6') { applyBlob(); }
    if (key === '7') { applyOutline(); }
    if (key === '8') { applyStamp(); }
    if (key === '9') { applySticker(); }
    if (key === 'w') { applyBgImage(); }
    if (key === 'c') { blendMode(BLEND); clear(); }
    if (key === 'a') { blendMode(BLEND); currentBlend = 'BLEND'; }
    if (key === 's') { blendMode(MULTIPLY); currentBlend = 'MULTIPLY'; }
}

function handleFile() {
    const input = document.getElementById('upload');
    const file = input.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    images = loadImage(url);
}

// ====================== UI BINDING ======================

function bindUI() {
    // Tool palette
    document.getElementById('tool-bar').addEventListener('click', e => {
        const btn = e.target.closest('button[data-tool]');
        if (!btn) return;
        document.querySelectorAll('#tool-bar button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTool = btn.dataset.tool;
    });

    // Pen settings
    bindColor('pen-color', v => { PenColour = v; });
    bindRange('pen-size', 'pen-size-val', v => { PenSize = parseFloat(v); });
    bindSelect('blend-mode', v => {
        currentBlend = v;
        if (typeof window[v] !== 'undefined') blendMode(window[v]);
    });

    // Tag settings
    bindText('tag-text', v => { Tag = v; });
    bindSelect('tag-font', v => { Style = v; });
    bindRange('tag-size', 'tag-size-val', v => { TagSize = parseFloat(v); });
    bindColor('tag-color', v => { TagColour = v; });

    // Crew settings
    bindText('crew-text', v => { Crew = v; });
    bindSelect('crew-font', v => { CrewStyle = v; });

    // Background settings — bgColor decomposes hex into r/g/b globals
    bindColor('bg-color', v => {
        const m = /^#([0-9a-f]{6})$/i.exec(v);
        if (!m) return;
        const n = parseInt(m[1], 16);
        r = (n >> 16) & 255;
        g = (n >> 8) & 255;
        b = n & 255;
    });
    bindRange('bg-opacity', 'bg-opacity-val', v => { opacity = parseFloat(v); });

    // Action buttons (replace the old jQuery handlers).
    // NOTE: button IDs are intentionally prefixed (btn-clear/btn-save) because
    // HTML5 promotes any id="clear" to window.clear, which collides with p5's
    // global clear() function and silently breaks the canvas.
    document.getElementById('btn-clear').addEventListener('click', () => {
        clear();
        blendMode(BLEND);
    });
    document.getElementById('btn-save').addEventListener('click', () => {
        saveCanvas('stickUp', 'png');
    });

    // Info modal
    const modal = document.getElementById('info-modal');
    document.getElementById('open-info').addEventListener('click', () => modal.hidden = false);
    document.getElementById('close-info').addEventListener('click', () => modal.hidden = true);
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.hidden = true;
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
    });
}

function bindRange(inputId, valueId, onChange) {
    const input = document.getElementById(inputId);
    const valEl = document.getElementById(valueId);
    onChange(input.value);
    if (valEl) valEl.textContent = input.value;
    input.addEventListener('input', () => {
        onChange(input.value);
        if (valEl) valEl.textContent = input.value;
    });
}

function bindColor(id, onChange) {
    const input = document.getElementById(id);
    onChange(input.value);
    input.addEventListener('input', () => onChange(input.value));
}

function bindText(id, onChange) {
    const input = document.getElementById(id);
    onChange(input.value);
    input.addEventListener('input', () => onChange(input.value));
}

function bindSelect(id, onChange) {
    const sel = document.getElementById(id);
    onChange(sel.value);
    sel.addEventListener('change', () => onChange(sel.value));
}
