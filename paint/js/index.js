var PenSize = 0;
var img;
var img1;
var oosh;
var img106;
var img130;
var img2;
let myFont;
var speed = 8;
var angle = 3.03;
var scalar = 10;
var PenColour = '#ffffff';
var FontColour = '#ffffff';
var TextSize = 600;
var Alias = 'Alias';
var Crew = 'Crew';
var CrewFont = 'urbandecay';
var AliasFont = 'paint';
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
  background(img, 0, 0);
  strokeWeight(PenSize);

  gui = createGui('Controls');
  gui.addGlobals('PenColour');
  gui.addGlobals('PenSize');
  gui.addGlobals('TextSize');
  gui.addGlobals('FontColour');
  gui.addGlobals('Alias');
  gui.addGlobals('AliasFont');
  gui.addGlobals('Crew');
  gui.addGlobals('CrewFont');


}
function draw() {
}
function handleFile() {
  const selectedFile = document.getElementById('upload');
  const myImageFile = selectedFile.files[0];
  let urlOfImageFile = URL.createObjectURL(myImageFile);
  images = loadImage(urlOfImageFile);
}
function mousePressed() {
  line(pmouseX, pmouseY, mouseX, mouseY);
}
function mouseDragged() {
  line(pmouseX, pmouseY, mouseX, mouseY);
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
function touchStarted() {
  fill(random(255),random(255),random(255));
  var c = mouseX;
  var d = mouseY;
  textFont(AliasFont)
  textSize(TextSize);
  text(Alias, c, d );
}
function keyTyped() {
  if (key === '0') {
    saveCanvas("train","jpg");
  }
  if (key === '1') {
    fill(FontColour);
    var c = mouseX;
    var d = mouseY;
    textFont(CrewFont)
    textSize(TextSize);
    text(Crew, c, d );
  }
  if (key === '2') {
    fill(random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(AliasFont)
    textSize(TextSize);
    text(Alias, c, d );
  }

  if (key === '3') {
    PenSize;
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
    fill(FontColour);
    var c = mouseX;
    var d = mouseY;
    textFont(AliasFont)
    textSize(TextSize);
    text(Alias, c, d );
  }
  if (key === '6') {
    background(random(255),random(255),random(255));
  }
  if (key === '7') {
    imageMode(CENTER);
    image(images,mouseX, mouseY, img.width, img.height);
  }
}
