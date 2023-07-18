let img;

function preload() {
  img = loadImage("https://happycoding.io/images/stanley-1.jpg");
}

function setup() {
  createCanvas(300, 300);
}

function draw() {
  //image(img, 0, 0);

  // Get the color at the mouse position
  let c = img.get(mouseX, mouseY);

  // Change the fill to that color
  fill(c);
  stroke(c);

  // Draw a square with that color
  ellipse(mouseX, mouseY, 5,5);
}
