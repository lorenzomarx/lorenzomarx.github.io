var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: Math.min(document.documentElement.clientWidth, 800),
        height: Math.min(document.documentElement.clientHeight, 600),
        showAngleIndicator: true
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// add bodies
var count = 0;
var stack = Composites.stack(20, 300, 10, 8, 0, 0, function(x, y) {

    var wth = 80
    if (count % 20 === 0 || count % 20 === 19) {
        wth = 40;
    }
    count++;

    return Bodies.rectangle(x, y, wth, 30, {
        friction: 1,
        density: 0.1,
        restitution: 0
    });

});

World.add(world, stack);

World.add(world, [
    // walls
    //Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 1000, 50, {
        isStatic: true
    }),
    Bodies.rectangle(0, 300, 40, 600),
    Bodies.rectangle(800, 300, 40, 600)
]);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: {
        x: 0,
        y: 0
    },
    max: {
        x: 800,
        y: 600
    }
});