var noiseFactor = 0;
var radius = 100;
var totalPoints = 60;
var angle;

function setup() {

  var canvas = createCanvas(1000, 400);
  canvas.parent('jumbo-canvas');
  noCursor();
  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));

  angle = 2 * PI / totalPoints;
  
}



function draw() {

  for (var i = 0; i < touches.length; i++) {


  }

  if (mouseIsPressed) {
    fill(this.one);
    stroke(this.four);
  } else {
    fill(this.two);
    stroke(this.three);
  }
  if (key === 'p') {
    fill(random(255),random(255),random(255),random(255));
    stroke(random(255),random(255),random(255),random(255));
  }
  if (key === 'q') {
    fill(this.five);
    stroke(this.three);
  }
  if (key === 'u') {
    fill(this.four);
    stroke(this.five);
  }

  push();
  beginShape();
    for (var i = 0; i <= totalPoints; i++) {
      var x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-1, 1)));
      var y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-1, 1)));
      curveVertex(x, y, 10, 10);
    }
  endShape(CLOSE);
  noiseFactor += 0.1;
  pop();


  push();
  textSize(32);
  fill(this.two);
  text("Up", 10, 30);
  fill(this.four);
  text("The", 10, 60);
  fill(this.five);
  text("Rust", 10, 90);
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
  if (key === 'r') {
    background(random(255),random(255),random(255),random(255));
  }
}
