// ─── Assets ───────────────────────────────────────────────────────────────────
let trainImg, fonts = {}, stickers = [], uploadedImg = null;

// ─── Tool & app state ─────────────────────────────────────────────────────────
let currentTool = 'pen';
let flowActive = false;
let flowVecs = [];
let flowZ = 0;
let noiseFactor = 0;
let totalPts = 60;
let blobAngle;
let lastX = 0, lastY = 0;

// ─── Settings helpers ─────────────────────────────────────────────────────────
const get = id => document.getElementById(id);

const S = {
  penColor:    () => get('pen-color').value,
  penSize:     () => +get('pen-size').value,
  tagText:     () => get('tag-text').value || 'Tag',
  tagColor:    () => get('tag-color').value,
  tagSize:     () => +get('tag-size').value,
  tagFont:     () => get('tag-font').value,
  tagRandom:   () => get('tag-random').checked,
  tagMultiply: () => get('tag-multiply').checked,
  crewText:    () => get('crew-text').value || 'Crew',
  crewFont:    () => get('crew-font').value,
  shapeColor:  () => get('shape-color').value,
  opacity:     () => +get('opacity').value,
  radius:      () => +get('radius').value,
  stickerIdx:  () => +get('sticker-select').value,
  stickerSize: () => +get('sticker-size').value,
};

// ─── Preload ──────────────────────────────────────────────────────────────────
function preload() {
  trainImg = loadImage('train.png');

  stickers = [
    loadImage('images/goldie.png'),
    loadImage('images/hemi.png'),
    loadImage('images/chicorelli.png'),
    loadImage('images/kemistry.png'),
    loadImage('images/queen.png'),
    loadImage('images/Rua_Kenana_Mihaia.png'),
  ];

  const fontDefs = [
    ['paint',   'fonts/paint.otf'],
    ['bomb',    'fonts/bomb.otf'],
    ['ny',      'fonts/NYFat.ttf'],
    ['urban',   'fonts/urbandecay.ttf'],
    ['throwup', 'fonts/throwup.ttf'],
    ['brock',   'fonts/Brock.ttf'],
    ['pein',    'fonts/Pein.ttf'],
    ['gas',     'fonts/Gas.otf'],
    ['squiz',   'fonts/squiz.ttf'],
    ['drip',    'fonts/drip.ttf'],
    ['chase',   'fonts/chase.ttf'],
    ['locals',  'fonts/Locals.ttf'],
    ['sparta',  'fonts/sparta_out.otf'],
    ['mars',    'fonts/mars.otf'],
  ];

  for (const [name, path] of fontDefs) {
    fonts[name] = loadFont(path);
  }
}

// ─── Setup ────────────────────────────────────────────────────────────────────
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight - 100);
  cnv.parent('canvas-container');
  background(255);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  blobAngle = TWO_PI / totalPts;
  initFlow();
  noLoop();
  setupUI();
}

// ─── Draw loop (flow field only) ──────────────────────────────────────────────
function draw() {
  if (flowActive) drawFlow();
}

// ─── Flow field ───────────────────────────────────────────────────────────────
function initFlow() {
  flowVecs = [];
  flowZ = 0;
  const scl = 20;
  const H = floor(height / scl);
  const W = floor(width / scl);
  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      const a = noise(j / 100, i / 100, flowZ) * TWO_PI * 7;
      flowVecs.push(p5.Vector.fromAngle(a).setMag(1));
    }
  }
}

function drawFlow() {
  const scl = 20;
  const H = floor(height / scl);
  const W = floor(width / scl);
  const col = hexToRgb(S.shapeColor());

  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      const idx = i * W + j;
      if (!flowVecs[idx]) continue;
      const v = flowVecs[idx];
      const x = j * scl;
      const y = i * scl;
      const abc = abs(Math.sin(v.heading())) * 5;

      push();
      translate(x + scl / 2, y);
      rotate(v.heading());
      noStroke();
      fill(col.r, col.g, col.b, S.opacity());
      beginShape();
      vertex(0, 0);
      vertex(scl - 5, 5 + abc);
      vertex(scl + abc, 0);
      vertex(scl - 5, -5 - abc);
      endShape(CLOSE);
      pop();

      flowVecs[idx] = p5.Vector.fromAngle(
        noise(j / 100, i / 100, flowZ) * TWO_PI * 7
      );
    }
  }
  flowZ += 0.002;
}

// ─── Tool actions ─────────────────────────────────────────────────────────────
function handleTap(x, y) {
  switch (currentTool) {
    case 'tag':    placeTag(x, y);           break;
    case 'crew':   placeCrew(x, y);          break;
    case 'blob':   placeBlob(x, y, true);    break;
    case 'ring':   placeBlob(x, y, false);   break;
    case 'sticker': placeSticker(x, y);      break;
    case 'train':  stampTrain(x, y);         break;
    case 'upload': stampUpload(x, y);        break;
  }
}

function placeTag(x, y) {
  const useRandom = S.tagRandom();
  blendMode(S.tagMultiply() ? MULTIPLY : BLEND);
  if (useRandom) {
    fill(random(255), random(255), random(255), S.opacity());
  } else {
    const c = hexToRgb(S.tagColor());
    fill(c.r, c.g, c.b);
  }
  noStroke();
  textFont(fonts[S.tagFont()]);
  textSize(S.tagSize());
  text(S.tagText(), x, y);
  blendMode(BLEND);
}

function placeCrew(x, y) {
  blendMode(MULTIPLY);
  fill(random(255), random(255), random(255), S.opacity());
  noStroke();
  textFont(fonts[S.crewFont()]);
  textSize(S.tagSize());
  text(S.crewText(), x, y);
  blendMode(BLEND);
}

function placeBlob(x, y, filled) {
  const r = S.radius();
  const col = hexToRgb(S.shapeColor());
  blendMode(BLEND);
  if (filled) {
    fill(col.r, col.g, col.b, S.opacity());
    noStroke();
  } else {
    stroke(S.penColor());
    strokeWeight(S.penSize());
    noFill();
  }
  beginShape();
  for (let i = 0; i <= totalPts; i++) {
    const bx = x + r * sin(blobAngle * i) * noise(noise(noiseFactor + random(-15, 15) * 0.01) * random(-1, 1));
    const by = y + r * cos(blobAngle * i) * noise(noise(noiseFactor + random(-15, 15) * 0.01) * random(-1, 1));
    curveVertex(bx, by, 10, 10);
  }
  endShape(CLOSE);
  noiseFactor += 0.1;
}

function placeSticker(x, y) {
  const idx = S.stickerIdx();
  const img = idx < 0 ? random(stickers) : stickers[idx];
  const sz = S.stickerSize();
  imageMode(CENTER);
  image(img, x, y, sz, sz * (img.height / img.width));
}

function stampTrain(x, y) {
  imageMode(CENTER);
  const aspect = trainImg.width / trainImg.height;
  const w = width * 0.95;
  image(trainImg, x, y, w, w / aspect);
}

function stampUpload(x, y) {
  if (!uploadedImg) return;
  const sz = S.stickerSize();
  imageMode(CENTER);
  image(uploadedImg, x, y, sz, sz * (uploadedImg.height / uploadedImg.width));
}

// ─── p5.js input events ───────────────────────────────────────────────────────
function mousePressed() {
  if (settingsOpen() || !onCanvas(mouseX, mouseY)) return;
  if (currentTool !== 'pen') handleTap(mouseX, mouseY);
}

function mouseDragged() {
  if (settingsOpen() || !onCanvas(mouseX, mouseY)) return false;
  if (currentTool === 'pen') {
    stroke(S.penColor());
    strokeWeight(S.penSize());
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  return false;
}

function touchStarted() {
  if (touches.length > 0) {
    lastX = touches[0].x;
    lastY = touches[0].y;
    if (!settingsOpen() && onCanvas(lastX, lastY) && currentTool !== 'pen') {
      handleTap(lastX, lastY);
    }
  }
  return false;
}

function touchMoved() {
  if (touches.length > 0 && currentTool === 'pen' && !settingsOpen()) {
    const tx = touches[0].x;
    const ty = touches[0].y;
    if (onCanvas(tx, ty)) {
      stroke(S.penColor());
      strokeWeight(S.penSize());
      line(tx, ty, lastX, lastY);
    }
    lastX = tx;
    lastY = ty;
  }
  return false;
}

function touchEnded() {
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight - 100);
  initFlow();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function onCanvas(x, y) {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

function settingsOpen() {
  return get('settings-panel').classList.contains('open');
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

// ─── UI wiring ────────────────────────────────────────────────────────────────
function setupUI() {
  // Tool buttons
  get('tools-row').querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      get('tools-row').querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTool = btn.dataset.tool;
    });
  });

  // Flow toggle
  get('flow-btn').addEventListener('click', () => {
    flowActive = !flowActive;
    get('flow-btn').classList.toggle('active', flowActive);
    if (flowActive) {
      initFlow();
      loop();
    } else {
      noLoop();
    }
  });

  // Fill background
  get('bg-btn').addEventListener('click', () => {
    const col = hexToRgb(get('shape-color').value);
    blendMode(BLEND);
    background(col.r, col.g, col.b, S.opacity());
  });

  // Clear
  get('clear-btn').addEventListener('click', () => {
    blendMode(BLEND);
    background(255);
  });

  // Save
  get('save-btn').addEventListener('click', () => {
    saveCanvas('stickUp', 'png');
  });

  // Settings open/close
  get('settings-btn').addEventListener('click', toggleSettings);
  get('settings-handle').addEventListener('click', toggleSettings);
  get('overlay').addEventListener('click', toggleSettings);

  // Range value displays
  [
    ['pen-size',     'pen-size-val'],
    ['tag-size',     'tag-size-val'],
    ['opacity',      'opacity-val'],
    ['radius',       'radius-val'],
    ['sticker-size', 'sticker-size-val'],
  ].forEach(([inputId, displayId]) => {
    const input = get(inputId);
    const display = get(displayId);
    if (!input || !display) return;
    input.addEventListener('input', () => { display.textContent = input.value; });
  });

  // File upload
  get('upload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadImage(url, img => {
      uploadedImg = img;
      // Auto-switch to upload tool
      get('tools-row').querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      const uploadBtn = document.querySelector('[data-tool="upload"]');
      if (uploadBtn) uploadBtn.classList.add('active');
      currentTool = 'upload';
    });
  });

  // Prevent settings panel scroll from bleeding through to canvas
  get('settings-panel').addEventListener('touchmove', e => e.stopPropagation(), { passive: false });
}

function toggleSettings() {
  const panel = get('settings-panel');
  const overlay = get('overlay');
  const isOpen = panel.classList.toggle('open');
  overlay.classList.toggle('visible', isOpen);
}
