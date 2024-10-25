var PenSize = 0;
var img;
var oosh;
var PenColour = '#ffffff';
var TagColour = '#ffffff';
var TagSize = 600;
var Alias = 'Alias';
var Crew = 'Crew';
var CrewTag = 'paint';
var AliasTag = 'paint';
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
var wildside = 'wildside';
var gui;

var noiseFactor = 0;
var radius = 100;
var totalPoints = 60;
var angle;

let backgrounds = []
let numBackgrounds = 5;
let stickers = []
let numStickers = 5;

let slider;

function fontRead(){
    fontReady = true; }


function preload(){
  img = loadImage("train.png");
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
  wildside = loadFont('fonts/wildside.ttf');
  backgrounds = [oosh]
  stickers = [img]
}

function setup() {

  var canvas = createCanvas(540, 960);
  imageMode(CENTER);
  canvas.parent("myCanvas");
  background( 0, 0);

  gui = createGui('Controls');
  gui.addGlobals('PenSize');
  sliderRange(0, 100, 1);
  gui.addGlobals('TagSize');
  gui.addGlobals('Alias');
  gui.addGlobals('AliasTag');
  gui.addGlobals('Crew');
  gui.addGlobals('CrewTag');

  gui2 = createGui('Colours');
  gui2.addGlobals('PenColour');
  gui2.addGlobals('TagColour');
  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));

  angle = 2 * PI / totalPoints;
  slider = createSlider(0, 255);
  slider.position(200, 10);
  slider.size(80);
}
function draw() {
  if (mouseIsPressed) {
		stroke(PenColour);
    line(mouseX, mouseY, pmouseX, pmouseY);
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
   }
);
$('#back').click(function(){
      background(255);
   }
);
$('#newimage').click(function(){
      saveCanvas("train","jpg");
   }
);
$('#newimages').click(function(){
      background(images);
      imageMode(CENTER);
   }
);

function keyTyped() {
  if (key === '0') {
    saveCanvas("train","jpg");
  }
  if (key === '1') {
    fill(TagColour);
    var c = mouseX;
    var d = mouseY;
    textFont(AliasTag)
    textSize(TagSize);
    textAlign(CENTER);
    text(Alias, c, d );
  }
  if (key === '2') {
    fill(random(255),random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(CrewTag)
    textSize(TagSize);
    textAlign(CENTER);
    text(Crew, c, d );
  }

  if (key === '3') {
    PenSize;
    strokeWeight(PenSize);
    stroke(PenColour);
  }
  if (key === '4') {
    let randoImg = random(stickers)
    imageMode(CENTER);
    image(randoImg, mouseX, mouseY, img.width, img.height);

  }
  if (key === '5') {
    fill(random(255),random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(AliasTag)
    textSize(TagSize);
    textAlign(CENTER);
    text(Alias, c, d );
  }
  if (key === '6') {
    background(random(255),random(255),random(255),random(255));
  }
  if (key === '7') {
    image(images,mouseX, mouseY);
    imageMode(CENTER);

  }
  if (key === '8'){
    fill(this.four);
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
  if (key === '9') {
    stroke(this.four);
    noFill();
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
  if (key === 'b') {
    let g = slider.value();
    background(g);
  }
  if (key === 'q') {
    let randoImg = random(backgrounds)
    image(randoImg, mouseX, mouseY);
    imageMode(CENTER);
  }
}
