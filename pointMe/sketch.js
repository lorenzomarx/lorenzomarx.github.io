var img;


function preload() {
  var myImageURL = "images/kai.jpg";
  underlyingImage = loadImage(myImageURL);

function setup() {
    createCanvas(800,800);
    background(255);
    underlyingImage.loadPixels();
    frameRate(200);
    rectMode(RADIUS);
}

function draw() {

    var theColorAtTheMouse = underlyingImage.get(mouseX, mouseY);
    noStroke();
    fill(theColorAtTheMouse);
    ellipse(mouseX, mouseY, 100, 100);
    //rotateX(frameCount * 0.01);
    //rotateY(frameCount * 0.01);
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
