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
var kennedy = 'kennedy';
var gui;

let backgrounds = []
let numBackgrounds = 5;
let stickers = []
let numStickers = 5;

function fontRead(){
    fontReady = true; }

function preload(){
  img = loadImage("train.png");
  kennedy = loadImage("images/kennedy_raster.png");
  cube = loadImage("images/colour_cube.jpg");
  oosh = loadImage("images/oosh_logo.png");
  img1 = loadImage("images/basquiat.png");
  img2 = loadImage("images/basquiatPunk.png");
  railway = loadImage("images/railway.jpg");
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
  locals = loadFont('fonts/locals.ttf',fontRead);
  backgrounds = [oosh,railway,kennedy]
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

function keyTyped() {
  if (key === '0') {
    saveCanvas("bot","jpg");
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
    var c = mouseX;
    var d = mouseY;
    line(c, d, 0, 0);
     angle += speed;
  }
  if (key === '6') {
    background(random(255),random(255),random(255));
    background(img);
  }
  if (key === '7') {
    stroke(random(255),random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    line(c, d, 0, 0);
     angle += speed;
  }
  stroke(PenColour);
}
