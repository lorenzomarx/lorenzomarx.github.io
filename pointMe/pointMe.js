var underlyingImage;
var noiseFactor = 0;
var radius = 50;
var totalPoints = 100;
var angle;

function preload() {
    var myImageURL = "images/fire.jpg";
    underlyingImage = loadImage(myImageURL);
    //filter(INVERT);
}

function setup() {
  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));

   angle = 2 * PI / totalPoints;
    createCanvas(1200,1200);
    background(255);
    underlyingImage.loadPixels();
    frameRate(10);
}

function draw() {

    var theColorAtTheMouse = underlyingImage.get(mouseX, mouseY);
    fill(theColorAtTheMouse);
    noStroke();

    push();
    beginShape();
      for (var i = 0; i <= totalPoints; i++) {
        var x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-4, 4)));
        var y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-4, 4)));
        //ellipse(x, y, 30, 30);
        curveVertex(x, y, 30, 30);
        //stroke(4);
      }
    endShape(CLOSE);
    noiseFactor += 0.1;
    pop();
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
