//  http://brm.io/matter-js/docs/
//  http://brm.io/matter-js/demo/#mixed
//  https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js

// module aliases
//game objects values
var game = {
  width: window.innerWidth,//1200,
  height: window.innerHeight, //800,
  amount: 5, //slows around 100 balls
  gravity: 0.001,
  ballSize: 10,
  friction: 0,
  frictionStatic: 1,
  frictionAir: 0,
  restitution: 0.5,
  velocityVector: true,
  lastTimeStamp: 0,
}
function resetSettings(){
  game.gravity = 0.001;
  //game.friction = 0;
  //game.frictionStatic = 1;
  game.frictionAir = 0;
  //update DAT.GUI display
  for (var i in gui.__controllers) {
    gui.__controllers[i].updateDisplay();
  }
  for (var i in add.__controllers) {
    add.__controllers[i].updateDisplay();
  }
}

game.simpleOrbit = function() {
  resetSettings();
  World.clear(engine.world, true);
  ball = [];
  game.friction
  preMadeBody(game.width*0.5, game.height*0.5, 50, 0, 0, 0);
  preMadeBody(game.width*0.5-250, game.height*0.5, 1, 0, 0, 6);
};
game.orbits = function() {
  resetSettings();
  World.clear(engine.world, true);
  ball = [];
  game.friction
  preMadeBody(game.width*0.5, game.height*0.5, 50, 0, 0, 0);
  preMadeBody(game.width*0.5-300, game.height*0.5, 1, 0, 0, 6);
  preMadeBody(game.width*0.5, game.height*0.5+250, 1, 0, 6, 0);
  preMadeBody(game.width*0.5+200, game.height*0.5, 1, 0, 0, -6);
  preMadeBody(game.width*0.5, game.height*0.5-300, 1, 0, -6, 0);
};
game.distance = function() {
  resetSettings();
  World.clear(engine.world, true);
  ball = [];
  game.friction
  preMadeBody(game.width*0.5, game.height*0.5, 50, 0, 0, 0);
  preMadeBody(game.width*0.5-300, game.height*0.5, 1, 0, 0, 5);
  preMadeBody(game.width*0.5-275, game.height*0.5, 1, 0, 0, 5);
  preMadeBody(game.width*0.5-250, game.height*0.5, 1, 0, 0, 5);
  preMadeBody(game.width*0.5-225, game.height*0.5, 1, 0, 0, 5);
  preMadeBody(game.width*0.5-200, game.height*0.5, 1, 0, 0, 5);
};
game.velocity = function() {
  resetSettings();
  World.clear(engine.world, true);
  ball = [];
  game.friction
  preMadeBody(game.width*0.5, game.height*0.5, 50, 0, 0, 0);
  preMadeBody(game.width*0.5-260, game.height*0.5, 1, 0, 0, 7);
  preMadeBody(game.width*0.5-250, game.height*0.5, 1, 0, 0, 6);
  preMadeBody(game.width*0.5-240, game.height*0.5, 1, 0, 0, 5);
  preMadeBody(game.width*0.5-230, game.height*0.5, 1, 0, 0, 4);
  preMadeBody(game.width*0.5-220, game.height*0.5, 1, 0, 0, 3);
};
game.fourBodyDance = function() {
  resetSettings();
  World.clear(engine.world, true);
  ball = [];
  preMadeBody(game.width*0.5+100, game.height*0.5+100, 12, 0, 1, 0);
  preMadeBody(game.width*0.5-100, game.height*0.5-100, 12, 0,-1, 0);
  preMadeBody(game.width*0.5-100, game.height*0.5+100, 12, 0, 0, 1);
  preMadeBody(game.width*0.5+100, game.height*0.5-100, 12, 0, 0,-1);
};

game.add = function() {
  addBalls();
};
game.clear = function() {
  World.clear(engine.world, true);
  ball = [];
};

//GUI setup
var gui = new dat.GUI();
//gui.close();
gui.add(game, 'gravity', 0, 0.01).step(0.0001);
gui.add(game, 'clear');

var preMade = gui.addFolder('Premade systems');
preMade.close();
preMade.add(game, 'simpleOrbit');
preMade.add(game, 'orbits');
preMade.add(game, 'distance');
preMade.add(game, 'velocity');
preMade.add(game, 'fourBodyDance');


var add = gui.addFolder('add Bodies');
add.close();
add.add(game, 'add');
add.add(game, 'amount', 1, 100).step(1);
add.add(game, 'ballSize', 1, 100).step(1);
add.add(game, 'friction', 0, 1).step(0.001);
add.add(game, 'frictionStatic', 0, 1).step(0.001);
add.add(game, 'frictionAir', 0, 0.2).step(0.001);
add.add(game, 'restitution', 0, 1).step(0.001);

var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Events = Matter.Events,
  Body = Matter.Body,
  //Composites = Matter.Composites,
  Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

engine.velocityIterations = 4;
engine.positionIterations = 6;
engine.world.gravity.y = 0;
//engine.world.gravity.scale = 0.00;

var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: game.width,
    height: game.height,
    pixelRatio: 1,
    background: 'white',
    wireframeBackground: '#222',
    enabled: true,
    wireframes: false,
    showVelocity: true,
    showAngleIndicator: true,
    showCollisions: false,
  }
});

//add the walls
var offset = 25;
World.add(engine.world, [
  Bodies.rectangle(400, -offset, game.width * 2 + 2 * offset, 50, {
    isStatic: true,
    render: {
      restitution: 1,
      fillStyle: 'white',
      strokeStyle: 'black'
    }
  }),
  Bodies.rectangle(400, game.height + offset, game.width * 2 + 2 * offset, 50, {
    isStatic: true,
    render: {
      restitution: 1,
      fillStyle: 'white',
      strokeStyle: 'black'
    }
  }),
  Bodies.rectangle(game.width + offset, 300, 50, game.height * 2 + 2 * offset, {
    isStatic: true,
    render: {
      restitution: 1,
      fillStyle: 'white',
      strokeStyle: 'black'
    }
  }),
  Bodies.rectangle(-offset, 300, 50, game.height * 2 + 2 * offset, {
    isStatic: true,
    render: {
      restitution: 1,
      fillStyle: 'white',
      strokeStyle: 'black'
    }
  })
]);

//add an array of objects
var ball = []

function preMadeBody(x, y, r, sides, Vx, Vy) {
  var i = ball.length;
  ball.push();
  ball[i] = Bodies.polygon(x, y, sides,r, {
    friction: game.friction,
    frictionStatic: game.frictionStatic,
    frictionAir: game.frictionAir,
    restitution: game.restitution,
    render: {
      fillStyle: randomColor({
        //luminosity: 'light',
        //hue: 'green'
      }),
      strokeStyle: 'black'
    }
  })
  Matter.Body.setVelocity(ball[i], {
    x: Vx,
    y: Vy
  })
  World.add(engine.world, ball[i]);
}

function addBalls() {
  for (var j = 0; j < game.amount; j++) {
    preMadeBody(Math.random() * game.width, Math.random() * game.height, game.ballSize, 1 + Math.ceil(Math.random()*6), (0.5-Math.random())*4, (0.5-Math.random())*4);
  }
}
//addBalls();
game.simpleOrbit();

function gravity() {
  var length = ball.length
  for (var i = 0; i < length; i++) {
    for (var j = 0; j < length; j++) {
      if (i != j) {
        var Dx = ball[j].position.x - ball[i].position.x;
        var Dy = ball[j].position.y - ball[i].position.y;
        var force = (engine.timing.timestamp-game.lastTimeStamp)*game.gravity * ball[j].mass * ball[i].mass / (Math.sqrt(Dx * Dx + Dy * Dy))
        var angle = Math.atan2(Dy, Dx);
        ball[i].force.x += force * Math.cos(angle);
        ball[i].force.y += force * Math.sin(angle);
      }
    }
  }
  game.lastTimeStamp = engine.timing.timestamp;
}

Events.on(engine, "beforeTick", function(event) {
  game.cycle++;
  gravity();
});

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
