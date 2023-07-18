var angle = 3.03;
var offset = 10;
var scalar = 20;
var speed = 30;

function setup(){
  createCanvas(540,540);
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
  textSize(32);

  if (keyCode == CONTROL) {
    fill(255,255,255);
    stroke(255);

}
  if (keyCode == LEFT_ARROW) {
    fill(this.f);
    stroke(this.g);

}

   ellipse(x, y, 100, 100);
   translate(mouseX, mouseY);

  angle += speed;

  if (keyCode == UP_ARROW) {
    background(255,255,255);

} else if (keyCode == DOWN_ARROW) {
    background(this.e);


  }

}
