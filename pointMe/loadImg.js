let input;
let img;

function setup() {
  input = createFileInput(handleFile);
  input.position(0, 0);
  createCanvas(400,400);
}

function draw() {
  background(255);

  if (img) {
    image(img, 0, 0, width, height);
    
  }
  ellipse(mouseX, mouseY, 50, 50);
}

function handleFile(file) {
    img = createImg(file.data);
    img.hide();

}
