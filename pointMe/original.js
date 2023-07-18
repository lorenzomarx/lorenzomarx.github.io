var underlyingImage;
var speed = 50;
var diameter = 5;


function preload() {
    var myImageURL = "images/kai.jpg";
    underlyingImage = loadImage(myImageURL);
}

function setup() {
    createCanvas(500, 500);
    background(0);
    underlyingImage.loadPixels();
    frameRate(100);

}

function draw() {
    var px = random(width);
    var py = random(height);
    var ix = constrain(floor(px), 0, width-1);
    var iy = constrain(floor(py), 0, height-1);
    var theColorAtLocationXY = underlyingImage.get(ix, iy);

    noStroke();
    fill(theColorAtLocationXY);
    ellipse(px, py, 6, 6);
  }

  function keyTyped() {
    if (key === 's') {
      saveCanvas("bot","jpg");
    }
    if (key === 'w') {
      background(255);
    }
    if (key === 'b') {
      background(0);
    }
  }
