var PenSize = 0;
var canSize = 0;
var img;
var chico;
var royal;
var queen;
var junglist;
var hemi;
var PenColour = '#ffffff';
var TagColour = '#8f8f8f';
var TagSize = 600;
var Tag = 'Cram';
var Crew = 'Cram';
var CrewStyle = 'paint';
var Style = 'paint';
var ny = 'ny';
var urban = 'urban';
var pein = 'pein';
var bomb = 'bomb';
var gas = 'gas';
var squiz = 'squiz';
var drip = 'drip';
var chase = 'chase';
var locals = 'locals';
var sparta_out = 'sparta_out';
var mars = 'mars';
var throwup = 'throwup';
var gui;
var opacity = 0;
var noiseFactor = 0;
var radius = 100;
var totalPoints = 60;
var angle;
var r = 0;
var g = 0;
var b = 0;

let backgrounds = []
let numBackgrounds = 5;
let stickers = []
let numStickers = 5;


let H, W;
let v = [];
let p = [];
var scl = 20;
var z = 0.002;

function fontRead(){
    fontReady = true; }


function preload(){
  img = loadImage("train.png");
  queen = loadImage("images/kemistry.png");
  chico = loadImage("images/chicorelli.png");
  royal = loadImage("images/queen.png");
  hemi = loadImage("images/hemi.png");
  rua = loadImage("images/Rua_Kenana_Mihaia.png");
  junglist = loadImage("images/goldie.png");
  oosh = loadImage("images/oosh_logo.png");
  bomb = loadFont('fonts/bomb.otf',fontRead);
  paint = loadFont('fonts/paint.otf',fontRead);
  ny = loadFont('fonts/NYFat.ttf',fontRead);
  urban = loadFont('fonts/urbandecay.ttf',fontRead);
  throwup = loadFont('fonts/throwup.ttf',fontRead);
  brock = loadFont('fonts/Brock.ttf',fontRead);
  pein = loadFont('fonts/Pein.ttf',fontRead);
  gas = loadFont('fonts/Gas.otf',fontRead);
  squiz = loadFont('fonts/squiz.ttf',fontRead);
  drip = loadFont('fonts/drip.ttf',fontRead);
  chase = loadFont('fonts/chase.ttf',fontRead);
  locals = loadFont('fonts/Locals.ttf',fontRead);
  sparta_out  = loadFont('fonts/sparta_out.otf',fontRead);
  mars  = loadFont('fonts/mars.otf',fontRead);
  backgrounds = [junglist]
  stickers = [junglist,hemi,chico]
}

function setup() {
  var canvas = createCanvas(540, 960);
  imageMode(CENTER);
  canvas.parent("myCanvas");
  background( 0, 0);

  gui = createGui('Controls');
  sliderRange(0, 255, 1);
  gui.addGlobals('opacity');
  sliderRange(0, 255, 1);
  gui.addGlobals('r');
  sliderRange(0, 255, 1);
  gui.addGlobals('g');
  sliderRange(0, 255, 1);
  gui.addGlobals('b');
  sliderRange(0, 10, 1);
  gui.addGlobals('PenSize');
  sliderRange(0, 50, 1);
  gui.addGlobals('canSize');
  gui.addGlobals('scl');
  sliderRange(0, 100, 1);
  gui.addGlobals('z');
  sliderRange(0, 100, 1);

  gui.addGlobals('TagSize');
  gui.addGlobals('Tag');
  gui.addGlobals('Style');
  gui.addGlobals('Crew');
  gui.addGlobals('CrewStyle');
  gui.addGlobals('PenColour');
  gui.addGlobals('TagColour');

  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));


  angle = 2 * PI / totalPoints;
  H = height / scl;
  W = width / scl;
     for (let i = 0; i < H; i++) {
     for (let j = 0; j < W; j++) {
     let index = i * W + j;
     let a = noise(j / 100, i / 100, z) * TWO_PI * 7;
         v[index] = p5.Vector.fromAngle(a).setMag(1);
    }
  }
}

function draw() {
  if (mouseIsPressed) {
		stroke(PenColour);
    strokeWeight(PenSize);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

  if (key === 'b') {
    let abc=0;
    for (let i = 0; i < H; i++) {
      for (let j = 0; j < W; j++) {
        let index = i * W + j;
        let y = i * scl;
        let x = j * scl;

        push();
        translate(x+scl/2, y);
        abc=abs(Math.sin(v[index].heading()))*5;
        rotate(v[index].heading());
        noStroke();
        fill(this.five)
        beginShape();
        vertex(0,0);
        vertex(scl - 5, 5+abc);
        vertex(scl+abc, 0);
        vertex(scl - 5, -5-abc);
        endShape(CLOSE);
        pop();
        let a = noise(j / 100, i / 100, z) * TWO_PI * 7;
        v[index] = p5.Vector.fromAngle(a);
      }
    }
    z += 0.002;
    textSize(32);
  }

}

function handleFile() {
  const selectedFile = document.getElementById('upload');
  const myImageFile = selectedFile.files[0];
  let urlOfImageFile = URL.createObjectURL(myImageFile);
  images = loadImage(urlOfImageFile);
}


$('#clear').click(function(){
      background(255);
      PenSize;
      strokeWeight(PenSize);
      stroke(PenColour);
      clear();
   }
);
$('#back').click(function(){
      background(255);
   }
);
$('#newimage').click(function(){
      saveCanvas("stickUp","png");
   }
);
$('#newimages').click(function(){
      imageMode(CENTER);
      background(images);

   }
);
//function mouseDragged() {
  // Using the copy() function, copy the bottom image
  // on top of the top image when you drag your cursor
  // across the canvas.
//  copy(images, mouseX, mouseY, 20, 20, mouseX, mouseY, 20, 20);
//}

function keyPressed() {

  if (key === '4') {
    fill(TagColour);
    var c = mouseX;
    var d = mouseY;
    textFont(Style)
    textSize(TagSize);
    textAlign(CENTER);
    text(Tag, c, d );
    strokeWeight(0);
  }
  if (key === '2') {
    fill(random(255),random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(CrewStyle)
    textSize(TagSize);
    textAlign(CENTER);
    blendMode(MULTIPLY);
    text(Crew, c, d );
  }

  if (key === '1') {
    PenSize;
    strokeWeight(PenSize);
    stroke(PenColour);
    blendMode(BLEND);
  }
  if (key === '9') {
    let randoImg = random(stickers)
    imageMode(CENTER);
    image(randoImg, mouseX, mouseY);

  }
  if (key === '3') {
    fill(random(255),random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(Style)
    textSize(TagSize);
    textAlign(CENTER);
    blendMode(MULTIPLY);
    text(Tag, c, d );
  }
  if (key === '5') {
    background(r,g,b,opacity);
  }
  if (key === '8') {
    image(images,mouseX, mouseY);
    imageMode(CENTER);

  }
  if (key === '6'){
    fill(PenColour);
    strokeWeight(PenSize);
    beginShape();
      for (var i = 0; i <= totalPoints; i++) {
        var x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        var y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        curveVertex(x, y, 10, 10);
      }
    endShape(CLOSE);
    noiseFactor += 0.1;
  }

  if (key === '7') {
    stroke(this.four);
    noFill();
    angleMode(RADIANS);
    strokeWeight(PenSize);
    beginShape();
      for (var i = 0; i <= totalPoints; i++) {
        var x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        var y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-15, 15) * 0.01)) * (random(-1, 1)));
        curveVertex(x, y, 10, 10);
      }
    endShape(CLOSE);
    noiseFactor += 0.1;
  }


  if (key === 'w') {
    let randoImg = random(backgrounds)
    image(randoImg, mouseX, mouseY);
    imageMode(CENTER);
  }
  if (key === 'c') {
    blendMode(BLEND);
    clear();
  }
  if (key === 'a') {
    blendMode(BLEND);
  }
  if (key === 's') {
    blendMode(MULTIPLY);
  }
  if (key === 'z') {

    blendMode(MULTIPLY);
  }
}
