// Maurer Rose
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/CodingInTheCabana/002-collatz-conjecture.html
// https://youtu.be/4uU9lZ-HSqA
// https://editor.p5js.org/codingtrain/sketches/qa7RiptE9

let n = 64;
let d = 71;
let dSlider;

function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES);
  dSlider = createSlider(1,20,1);
  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));
}

function draw() {
  //background(0);

  //translate(width/2,height/2);
  stroke(this.two);
  d = dSlider.value();
  fill(this.one);
  push();
  beginShape();
  strokeWeight(3);
  for (let i = 0; i < 361; i++) {
    let k = i * d;
    let r = 150 * sin(n*k);
    let x = mouseX + r * cos(k);
    let y = mouseY + r * sin(k);
    vertex(x,y);
  }
  endShape();
  pop();

  noFill();
  stroke(255,0,255, 255);
  strokeWeight(2);


  n += 0.001;
  d += 0.003;

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
