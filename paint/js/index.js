var PenSize = 0;
var img;
var img1;
var img84;
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
var Alias = 'ALIAS';
var Tag = 'TAG';
var FontTag = 'Paint';
var FontAlias = 'Paint';

var gui;
function fontRead(){
    fontReady = true; }

function preload(){
  img = loadImage("images/train.png");
  img1 = loadImage("images/basquiat.png");
  img2 = loadImage("images/basquiatPunk.png");
  img84 = loadImage("images/1.png");
  img106 = loadImage("images/106.png");
  img130 = loadImage("images/130.png");
  myFont = loadFont('fonts/bomb.otf',fontRead);
  paint = loadFont('fonts/paint.otf',fontRead);
  ny = loadFont('fonts/NYFat.ttf',fontRead);
  urban = loadFont('fonts/urbandecay.ttf',fontRead);
  brock = loadFont('fonts/Brock.ttf',fontRead);
  pein = loadFont('fonts/Pein.ttf',fontRead);
  gas = loadFont('fonts/Gas.otf',fontRead);
  squiz = loadFont('fonts/squiz.ttf',fontRead);
  ghetto = loadFont('fonts/GhettoSteez.ttf',fontRead);
  drip = loadFont('fonts/adrip1.ttf',fontRead);
  chase = loadFont('fonts/ChaseZen.ttf',fontRead);
  locals = loadFont('fonts/LocalsOnlyBalls.ttf',fontRead);
}

function setup() {

  var canvas = createCanvas(1000, 355);
  canvas.parent("myCanvas");
  background(img, 0, 0);
  strokeWeight(PenSize);

  gui = createGui('Controls');
  gui.addGlobals('PenColour');
  gui.addGlobals('PenSize');
  gui.addGlobals('TextSize');
  gui.addGlobals('FontColour');
  gui.addGlobals('Alias');
  gui.addGlobals('FontAlias');
  gui.addGlobals('Tag');
  gui.addGlobals('FontTag');


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
      background(img1);
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
    textFont(FontTag)
    textSize(TextSize);
    text(Tag, c, d );
  }
  if (key === '2') {
    fill(random(255),random(255),random(255));
    var c = mouseX;
    var d = mouseY;
    textFont(FontAlias)
    textSize(TextSize);
    text(Alias, c, d );
  }

  if (key === '3') {
    PenSize;
    strokeWeight(PenSize);
    stroke(PenColour);
  }
  if (key === '4') {
    image(img84, mouseX, mouseY, img.width/9, img.height/3);

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
