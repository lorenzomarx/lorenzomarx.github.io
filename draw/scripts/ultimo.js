var noiseFactor = 0;
var radius = 500;
var totalPoints = 50;
var angle;
var speed = 0.05;
var diameter = 40;
var offset = 400;
var scalar = 500;
var scalar2 = 50;


var e;
var f;
var a;
var b;
var c;
var d;

function setup() {

  createCanvas(1080,1080);
  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));
  e = width/2;
  f = height/2;


  angle = 2 * PI / totalPoints;
}

function draw() {

  if (mouseIsPressed) {
    fill(this.one);
    stroke(this.four);
  } else {
    fill(this.two);
    stroke(this.three);
  }

  push();
  beginShape();
    for (var i = 0; i <= totalPoints; i++) {
      var x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-1, 1)));
      var y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-1, 1)));
      //curveVertex(x, y, 10, 10);
      //noFill();
      ellipse(x, y, 20, 20);
    }
  endShape(CLOSE);
  noiseFactor += 0.1;

  pop();

  push();
  //art(e, f);
  bot(e, f);
  angle += speed;
  pop();


  push();
  textSize(32);
  fill(this.three);
  text("Digital", 10, 30);
  fill(this.four);
  text("Art", 10, 60);
  fill(this.five);
  text("Bot", 10, 90);
  pop();
}


function art(){
  push();
  textSize(300);
  var e = offset + cos(angle) * scalar2;
  var f = offset + sin(angle) * scalar2;
  translate(e, f);
  stroke(0);
  text("Art", 0, 0);
  pop();
}
function bot(){
  push();
  textSize(300);
  var e = offset + cos(angle) * scalar2;
  var f = offset + sin(angle) * scalar2;
  translate(e, f);
  stroke(0);
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
    background(random(255),random(255),random(255));
  }
}
