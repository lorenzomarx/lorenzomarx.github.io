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
var gui;
var noiseFactor = 0;
var radius = 100;
var totalPoints = 60;
var angle;
let backgrounds = []
let numBackgrounds = 5;
let stickers = []
let numStickers = 5;

function fontRead(){
    fontReady = true; }


function preload(){
  img = loadImage("train.png");
  oosh = loadImage("images/oosh_logo.png");
  bomb = loadFont('fonts/bomb.otf',fontRead);
  paint = loadFont('fonts/paint.otf',fontRead);
  ny = loadFont('fonts/NYFat.ttf',fontRead);
  urban = loadFont('fonts/urbandecay.ttf',fontRead);
  brock = loadFont('fonts/Brock.ttf',fontRead);
  pein = loadFont('fonts/Pein.ttf',fontRead);
  gas = loadFont('fonts/Gas.otf',fontRead);
  squiz = loadFont('fonts/squiz.ttf',fontRead);
  drip = loadFont('fonts/drip.ttf',fontRead);
  chase = loadFont('fonts/chase.ttf',fontRead);
  locals = loadFont('fonts/Locals.ttf',fontRead);
  sparta_out  = loadFont('fonts/sparta_out.otf',fontRead);
  mars  = loadFont('fonts/mars.otf',fontRead);
  backgrounds = [oosh]
  stickers = [img]
}

function setup() {

  var canvas = createCanvas(1000, 400);
  canvas.parent("myCanvas");
  background( 0, 0);
  gui = createGui('Controls');
  sliderRange(0, 100, 1);
  colorMode(HSB);
  gui.addGlobals('PenColour');
  gui.addGlobals('PenSize');
  gui.addGlobals('TagSize');
  gui.addGlobals('TagColour');
  gui.addGlobals('Alias');
  gui.addGlobals('AliasTag');
  gui.addGlobals('Crew');
  gui.addGlobals('CrewTag');
  this.one = color(random(255), random(255), random(255),random(255));
  this.two = color(random(255), random(255), random(255),random(255));
  this.three = color(random(255), random(255), random(255),random(255));
  this.four = color(random(255), random(255), random(255),random(255));
  this.five = color(random(255), random(255), random(255),random(255));

  angle = 2 * PI / totalPoints;
}
function draw() {


}

function handleFile() {
  const selectedFile = document.getElementById('upload');
  const myImageFile = selectedFile.files[0];
  let urlOfImageFile = URL.createObjectURL(myImageFile);
  images = loadImage(urlOfImageFile);
}


$('#clear').click(function(){
      background(img);
   }
);
$('#back').click(function(){
      background(255);
      background(img);
   }
);
$('#newimage').click(function(){
      background(random(backgrounds));
   }
);
$('#newimages').click(function(){
      background(images);
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
    text(Alias, c, d );
  }
  if (key === '2') {
    fill(random(255),random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(CrewTag)
    textSize(TagSize);
    text(Crew, c, d );
  }

  if (key === '3') {
    strokeWeight(PenSize);
    stroke(PenColour);
    imageMode(CORNERS);
  }
  if (key === '4') {
    let randoImg = random(stickers)
    imageMode(CENTER);
    image(randoImg, mouseX, mouseY, img.width, img.height);

  }
  if (key === '5') {
    fill(this.four);
    var c = mouseX;
    var d = mouseY;
    textFont(AliasTag)
    textSize(TagSize);
    text(Alias, c, d );
  }
  if (key === '6') {
    background(random(255),random(255),random(255),random(255));
  }
  if (key === '7') {
    imageMode(CENTER);
    image(images,mouseX, mouseY, img.width, img.height);
  }
  if (key === '8'){
    fill(this.one);
    strokeWeight(PenSize);
    beginShape();
      for (var i = 0; i <= totalPoints; i++) {
        var x = mouseX + radius * sin(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-1, 1)));
        var y = mouseY + radius * cos(angle * i) * noise(noise(noiseFactor + (random(-5, 5) * 0.01)) * (random(-1, 1)));
        curveVertex(x, y, 10, 10);
      }
    endShape(CLOSE);
    noiseFactor += 0.1;
  }
  if (key === '9') {
    fill(0,0,0);
    var c = mouseX;
    var d = mouseY;
    textFont(AliasTag)
    textSize(TagSize);
    text(Alias, c, d );
  }

}
