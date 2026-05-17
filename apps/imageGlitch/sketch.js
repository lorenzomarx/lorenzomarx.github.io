var img;
var video;
var useCamera = false;
var currentShape = 'square';
var currentAscii = null;
var asciiChars = ['@', '#', '*', '&', '%', '?'];
var asciiIndex = 0;
var w = 50;
var h = 50;
var offsetRange = 10;
var touchActive = false;

function preload() {
  img = loadImage('data/nath.jpg');
}

function setup() {
  var canvas = createCanvas(540, 540);
  canvas.parent('myCanvas');
  image(img, 0, 0);

  // tool buttons (shapes + ascii in sidebar)
  var allToolButtons = document.querySelectorAll('#tool-bar button, #ascii-bar button');
  allToolButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      allToolButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var tool = btn.dataset.tool;
      if (tool.indexOf('ascii-') === 0) {
        currentAscii = tool.charAt(tool.length - 1);
        currentShape = null;
      } else {
        currentShape = tool;
        currentAscii = null;
      }
    });
  });

  // size slider
  var sizeSlider = document.getElementById('size-slider');
  var sizeVal = document.getElementById('size-val');
  sizeSlider.addEventListener('input', function () {
    w = parseInt(sizeSlider.value);
    h = w;
    sizeVal.textContent = w;
  });

  // offset slider
  var offsetSlider = document.getElementById('offset-slider');
  var offsetVal = document.getElementById('offset-val');
  offsetSlider.addEventListener('input', function () {
    offsetRange = parseInt(offsetSlider.value);
    offsetVal.textContent = offsetRange;
  });

  // source select
  document.getElementById('source-select').addEventListener('change', function () {
    if (this.value === 'camera') {
      useCamera = true;
      if (!video) {
        video = createCapture(VIDEO);
        video.size(540, 540);
        video.hide();
      }
    } else {
      useCamera = false;
      clear();
      image(img, 0, 0);
    }
  });

  // action buttons
  document.getElementById('btn-reset').addEventListener('click', function () {
    clear();
    if (!useCamera) image(img, 0, 0);
  });

  document.getElementById('btn-save').addEventListener('click', function () {
    var d = new Date();
    var ts = nf(d.getFullYear() % 100, 2) + nf(d.getMonth() + 1, 2) + nf(d.getDate(), 2)
      + '_' + nf(d.getHours(), 2) + nf(d.getMinutes(), 2) + nf(d.getSeconds(), 2);
    saveCanvas(ts, 'jpg');
  });

  // clock
  updateClock();
  setInterval(updateClock, 1000);
}

function touchStarted(e) {
  if (e && e.target && e.target.closest('#myCanvas')) {
    touchActive = true;
    return false;
  }
}

function touchEnded() {
  touchActive = false;
}

function touchMoved(e) {
  if (e && e.target && e.target.closest('#myCanvas')) {
    return false;
  }
}

function draw() {
  var isMouse = mouseIsPressed;
  var isTouch = touchActive;
  if (!isMouse && !isTouch) return;

  var x1 = mouseX;
  var y1 = mouseY;
  var x2 = round(x1 + random(-offsetRange, offsetRange));
  var y2 = round(y1 + random(-offsetRange, offsetRange));

  var ctx = drawingContext;
  var camReady = useCamera && video && video.elt.readyState >= 2;

  if (currentAscii) {
    var ch = asciiChars[asciiIndex % asciiChars.length];
    asciiIndex++;
    var col;
    if (camReady) {
      col = sampleVideo(x1, y1);
    } else {
      col = get(x1, y1);
    }
    ctx.save();
    ctx.translate(x2, y2);
    ctx.font = 'bold ' + Math.round(w * 0.6) + 'px monospace';
    ctx.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  } else {
    ctx.save();
    ctx.beginPath();
    buildClipPath(ctx, x2, y2);
    ctx.clip();
    if (camReady) {
      var vw = video.elt.videoWidth;
      var vh = video.elt.videoHeight;
      var sx = vw / 540;
      var sy = vh / 540;
      ctx.drawImage(video.elt,
        (x1 - w / 2) * sx, (y1 - h / 2) * sy, w * sx, h * sy,
        x2 - w / 2, y2 - h / 2, w, h
      );
    } else {
      ctx.drawImage(ctx.canvas, x1 - w / 2, y1 - h / 2, w, h, x2 - w / 2, y2 - h / 2, w, h);
    }
    ctx.restore();
  }
}

function sampleVideo(x, y) {
  var vw = video.elt.videoWidth;
  var vh = video.elt.videoHeight;
  var scratch = document.createElement('canvas');
  scratch.width = 1;
  scratch.height = 1;
  var sctx = scratch.getContext('2d');
  sctx.drawImage(video.elt, x * vw / 540, y * vh / 540, 1, 1, 0, 0, 1, 1);
  var p = sctx.getImageData(0, 0, 1, 1).data;
  return [p[0], p[1], p[2], p[3]];
}

function buildClipPath(ctx, cx, cy) {
  var i, a, s, t, outerR, innerR, angle, halfAngle;
  switch (currentShape) {
    case 'square':
      ctx.rect(cx - w / 2, cy - h / 2, w, h);
      break;
    case 'circle':
      ctx.arc(cx, cy, w / 2, 0, Math.PI * 2);
      break;
    case 'triangle':
      ctx.moveTo(cx, cy - h / 2);
      ctx.lineTo(cx + w / 2, cy + h / 2);
      ctx.lineTo(cx - w / 2, cy + h / 2);
      ctx.closePath();
      break;
    case 'heart':
      s = w / 36;
      for (t = 0; t <= Math.PI * 2 + 0.01; t += 0.05) {
        var hx = 16 * Math.pow(Math.sin(t), 3) * s;
        var hy = (-(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 5.5) * s;
        if (t < 0.01) ctx.moveTo(cx + hx, cy + hy);
        else ctx.lineTo(cx + hx, cy + hy);
      }
      ctx.closePath();
      break;
    case 'star':
      outerR = w / 2;
      innerR = w / 5;
      angle = Math.PI * 2 / 5;
      halfAngle = angle / 2;
      for (i = 0; i < 5; i++) {
        a = -Math.PI / 2 + i * angle;
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
        else ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
        ctx.lineTo(cx + Math.cos(a + halfAngle) * innerR, cy + Math.sin(a + halfAngle) * innerR);
      }
      ctx.closePath();
      break;
  }
}

function keyReleased() {
  if (key == 's' || key == 'S') {
    var d = new Date();
    var ts = nf(d.getFullYear() % 100, 2) + nf(d.getMonth() + 1, 2) + nf(d.getDate(), 2)
      + '_' + nf(d.getHours(), 2) + nf(d.getMinutes(), 2) + nf(d.getSeconds(), 2);
    saveCanvas(ts, 'jpg');
  }
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    clear();
    if (!useCamera) image(img, 0, 0);
  }
}

function updateClock() {
  var now = new Date();
  var hrs = String(now.getHours()).padStart(2, '0');
  var min = String(now.getMinutes()).padStart(2, '0');
  var sec = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = hrs + ':' + min + ':' + sec;
}
