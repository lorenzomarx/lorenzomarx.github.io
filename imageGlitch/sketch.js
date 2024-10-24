
var img;

function preload() {
  img = loadImage('data/nath.jpg');
}

function setup() {
  var canvas = createCanvas(540, 540);
  canvas.parent("myCanvas");
  background(img, 0, 0);
  image(img, 0, 0);
}

function draw() {
  var x1 = mouseX;
  var y1 = mouseY;

  var x2 = round(x1 + random(-10, 10));
  var y2 = round(y1 + random(-10, 10));

  var w = 50;
  var h = 50;

  set(x2, y2, get(x1, y1, w, h));
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'jpg');
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    clear();
    image(img, 0, 0);
  }
}
