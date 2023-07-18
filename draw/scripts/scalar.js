var angle = 3.03;
var offset = 10;
var scalar = 20;
var speed = 30;

function setup(){
  var canvas = createCanvas(1000,540);
  canvas.parent('jumbo-canvas');
  noCursor();
  background(255);
  this.c = color(random(255), random(255), random(255),random(255));
  this.d = color(random(255), random(255), random(255),random(255));
  this.e = color(random(255), random(255), random(255),random(255));
  this.f = color(random(255), random(255), random(255),random(50));
  this.g = color(random(255), random(255), random(255),random(255));
  strokeWeight(2);

}
function draw(){
  var x = mouseX + cos(angle) * scalar;
  var y = mouseY + sin(angle) * scalar;
  if (mouseIsPressed) {
    fill(this.c);
    stroke(this.d);

} else {
    fill(this.d);
    stroke(this.c);

  }
  if (key === 'p') {
    fill(random(255),random(255),random(255),random(255));
    stroke(random(255),random(255),random(255),random(255));
  }
  textSize(32);
  push();
  ellipse(x, y, 100, 100);
  translate(mouseX, mouseY);

  angle += speed;
  pop();

 push();
 textSize(32);
 fill(this.c);
 text("Up", 10, 30);
 fill(this.d);
 text("The", 10, 60);
 fill(this.e);
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
