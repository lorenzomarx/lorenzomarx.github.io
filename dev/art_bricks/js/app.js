(function () {
  var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      World = Matter.World,
      Mouse = Matter.Mouse,
      Events = Matter.Events,
      MouseConstraint = Matter.MouseConstraint;

  var wrap = document.getElementById('canvas-wrap');
  var hud = document.getElementById('hud');
  var W = wrap.clientWidth;
  var H = wrap.clientHeight;

  var BRICK_W = 140;
  var BRICK_H = 70;
  var WALL_T = 50;
  var MIN_SIZE = 12;

  var MATERIALS = {
    brick: {
      label: 'BRICK',
      baseTolerance: 5,
      density: 0.002,
      restitution: 0,
      friction: 1,
      frictionStatic: 5,
      frictionAir: 0.005,
      fill: '#EC4899',
      stroke: '#831843',
      breakable: true
    },
    metal: {
      label: 'METAL',
      baseTolerance: Infinity,
      density: 0.008,
      restitution: 0,
      friction: 1,
      frictionStatic: 5,
      frictionAir: 0.005,
      fill: '#94A3B8',
      stroke: '#06B6D4',
      breakable: false
    }
  };

  var engine = Engine.create({
    positionIterations: 10,
    velocityIterations: 8,
    constraintIterations: 4
  });
  engine.world.gravity.y = 1;

  var render = Render.create({
    element: wrap,
    engine: engine,
    options: {
      width: W,
      height: H,
      background: '#0A0A0A',
      wireframes: false,
      showAngleIndicator: false
    }
  });

  var GROUND_TOP = H - 30;
  var walls = [
    Bodies.rectangle(W / 2, GROUND_TOP + WALL_T / 2, W + 100, WALL_T, { isStatic: true, render: { fillStyle: '#1a1a1a' } }),
    Bodies.rectangle(W / 2, -WALL_T / 2, W + 100, WALL_T, { isStatic: true, render: { fillStyle: '#1a1a1a' } }),
    Bodies.rectangle(-WALL_T / 2, H / 2, WALL_T, H + 100, { isStatic: true, render: { fillStyle: '#1a1a1a' } }),
    Bodies.rectangle(W + WALL_T / 2, H / 2, WALL_T, H + 100, { isStatic: true, render: { fillStyle: '#1a1a1a' } })
  ];
  World.add(engine.world, walls);

  var pieces = [];

  // ── Piece creation ──

  function makePiece(x, y, w, h, materialKey, vx, vy) {
    var mat = MATERIALS[materialKey];

    var body = Bodies.rectangle(x, y, w, h, {
      restitution: mat.restitution,
      friction: mat.friction,
      frictionStatic: mat.frictionStatic,
      frictionAir: mat.frictionAir,
      density: mat.density,
      slop: 0.01,
      render: {
        fillStyle: mat.fill,
        strokeStyle: mat.stroke,
        lineWidth: w > 30 ? 4 : 2
      }
    });

    body._w = w;
    body._h = h;
    body._material = materialKey;
    body._color = mat.fill;
    body._isBrick = true;
    body._breakable = mat.breakable && (w >= MIN_SIZE * 2 || h >= MIN_SIZE * 2);
    body._tolerance = mat.breakable ? 5 + Math.random() * 6 : Infinity;
    body._destroyed = false;

    if (vx !== undefined) Body.setVelocity(body, { x: vx, y: vy });

    pieces.push(body);
    World.add(engine.world, body);
    return body;
  }

  // ── Shatter ──

  function shatter(brick, impact) {
    var bw = brick._w;
    var bh = brick._h;
    var cx = brick.position.x;
    var cy = brick.position.y;
    var angle = brick.angle;
    var vx = brick.velocity.x;
    var vy = brick.velocity.y;

    var ratio = impact / Math.max(brick._tolerance, 0.1);
    var cols, rows;
    if (ratio < 2) { cols = 2; rows = 1; }
    else if (ratio < 4) { cols = 2; rows = 2; }
    else { cols = 3; rows = 2; }

    while (cols > 1 && bw / cols < MIN_SIZE) cols--;
    while (rows > 1 && bh / rows < MIN_SIZE) rows--;
    if (cols <= 1 && rows <= 1) return;

    var cellW = bw / cols;
    var cellH = bh / rows;
    var spread = 0.3 + ratio * 0.2;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var sw = cellW * (0.8 + Math.random() * 0.2);
        var sh = cellH * (0.8 + Math.random() * 0.2);

        var ox = -bw / 2 + cellW / 2 + c * cellW;
        var oy = -bh / 2 + cellH / 2 + r * cellH;

        var sx = cx + ox * cos - oy * sin;
        var sy = cy + ox * sin + oy * cos;

        var piece = makePiece(sx, sy, sw, sh, brick._material,
          vx * 0.3 + (Math.random() - 0.5) * spread,
          vy * 0.3 + (Math.random() - 0.5) * spread
        );
        piece._spawnTime = engine.timing.timestamp;
        Body.setAngle(piece, angle + (Math.random() - 0.5) * 0.15);
        Body.setAngularVelocity(piece, (Math.random() - 0.5) * 0.05);

        piece.render.fillStyle = shadeColor(brick._color, -15);
        piece._color = piece.render.fillStyle;
      }
    }
  }

  function shadeColor(hex, amt) {
    var num = parseInt(hex.slice(1), 16);
    var r = Math.min(255, Math.max(0, (num >> 16) + amt));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amt));
    var b = Math.min(255, Math.max(0, (num & 0xFF) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ── Scene ──

  function spawnInitial() {
    var onGround = GROUND_TOP - BRICK_H / 2;
    var spacing = W / 4;

    makePiece(spacing, onGround, BRICK_W, BRICK_H, 'metal', 0, 0);
    makePiece(spacing * 2, onGround, BRICK_W, BRICK_H, 'brick', 0, 0);
    makePiece(spacing * 3, onGround, BRICK_W, BRICK_H, 'brick', 0, 0);
    updateHud();
  }

  function resetScene() {
    World.clear(engine.world);
    Engine.clear(engine);
    engine.world.gravity.y = 1;
    World.add(engine.world, walls);
    World.add(engine.world, mouseConstraint);
    pieces = [];
    spawnInitial();
  }

  // ── Collisions ──

  Events.on(engine, 'collisionStart', function (event) {
    var toDestroy = [];

    for (var i = 0; i < event.pairs.length; i++) {
      var pair = event.pairs[i];
      var a = pair.bodyA;
      var b = pair.bodyB;

      var dvx = a.velocity.x - b.velocity.x;
      var dvy = a.velocity.y - b.velocity.y;
      var speed = Math.sqrt(dvx * dvx + dvy * dvy);

      if (speed < 5) continue;

      var now = engine.timing.timestamp;
      if ((a._spawnTime && now - a._spawnTime < 100) ||
          (b._spawnTime && now - b._spawnTime < 100)) continue;

      var aBreak = a._isBrick && a._breakable;
      var bBreak = b._isBrick && b._breakable;
      var aMetal = a._isBrick && a._material === 'metal';
      var bMetal = b._isBrick && b._material === 'metal';

      var fullMass = BRICK_W * BRICK_H * 0.002;
      var aForce = speed * Math.min(a.mass / fullMass, 1);
      var bForce = speed * Math.min(b.mass / fullMass, 1);

      if (aMetal && bBreak && aForce > 8)
        toDestroy.push({ body: b, impact: aForce * 3 });
      if (bMetal && aBreak && bForce > 8)
        toDestroy.push({ body: a, impact: bForce * 3 });

      if (aBreak && bBreak) {
        if (bForce > a._tolerance) toDestroy.push({ body: a, impact: bForce });
        if (aForce > b._tolerance) toDestroy.push({ body: b, impact: aForce });
      }

      if (aBreak && !b._isBrick && speed > a._tolerance)
        toDestroy.push({ body: a, impact: speed });
      if (bBreak && !a._isBrick && speed > b._tolerance)
        toDestroy.push({ body: b, impact: speed });
    }

    var changed = false;
    for (var k = 0; k < toDestroy.length; k++) {
      var entry = toDestroy[k];
      var brick = entry.body;
      if (!brick._destroyed) {
        brick._destroyed = true;
        shatter(brick, entry.impact);
        World.remove(engine.world, brick);
        var idx = pieces.indexOf(brick);
        if (idx > -1) pieces.splice(idx, 1);
        changed = true;
      }
    }
    if (changed) updateHud();
  });

  // ── Settle to static ──

  Events.on(engine, 'afterUpdate', function () {
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      if (p.isStatic || p._grabbed) continue;
      var speed = Math.sqrt(p.velocity.x * p.velocity.x + p.velocity.y * p.velocity.y);
      if (speed < 0.3) {
        p._restTicks = (p._restTicks || 0) + 1;
      } else {
        p._restTicks = 0;
      }
      if (p._restTicks > 30) {
        Body.setStatic(p, true);
      }
    }
  });

  // ── HUD ──

  function updateHud() {
    var breakable = 0, rubble = 0, metal = 0;
    for (var i = 0; i < pieces.length; i++) {
      if (pieces[i]._material === 'metal') metal++;
      else if (pieces[i]._breakable) breakable++;
      else rubble++;
    }
    hud.textContent = 'PIECES: ' + pieces.length +
      '  |  BREAKABLE: ' + breakable +
      '  |  RUBBLE: ' + rubble +
      '  |  METAL: ' + metal;
  }

  // ── Render labels ──

  Events.on(render, 'afterRender', function () {
    var ctx = render.context;

    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      if (p._w < 28 || p._h < 18) continue;

      ctx.save();
      ctx.translate(p.position.x, p.position.y);
      ctx.rotate(p.angle);

      var fs = Math.max(8, Math.min(13, p._w / 11));
      ctx.font = 'bold ' + fs + 'px Space Grotesk,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0A0A0A';

      if (p._material === 'metal') {
        ctx.fillText('METAL', 0, 0);
      } else if (p._breakable) {
        ctx.fillText('TOL:' + p._tolerance.toFixed(1), 0, 0);
      }

      ctx.restore();
    }
  });

  // ── Mouse ──

  var mouse = Mouse.create(render.canvas);
  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
  });
  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  Events.on(mouseConstraint, 'startdrag', function (e) {
    if (e.body) {
      e.body._grabbed = true;
      e.body._restTicks = 0;
      Body.setStatic(e.body, false);
    }
  });
  Events.on(mouseConstraint, 'enddrag', function (e) {
    if (e.body) {
      e.body._grabbed = false;
      e.body._restTicks = 0;
    }
  });

  // ── Buttons ──

  document.getElementById('btn-reset').addEventListener('click', resetScene);
  document.getElementById('btn-add').addEventListener('click', function () {
    var onGround = GROUND_TOP - BRICK_H / 2;
    var spacing = W / 4;
    var yOff = pieces.length * BRICK_H;
    makePiece(spacing, onGround - yOff, BRICK_W, BRICK_H, 'metal', 0, 0);
    makePiece(spacing * 2 + (Math.random() - 0.5) * 40, onGround - yOff, BRICK_W, BRICK_H, 'brick', 0, 0);
    makePiece(spacing * 3 + (Math.random() - 0.5) * 40, onGround - yOff, BRICK_W, BRICK_H, 'brick', 0, 0);
    updateHud();
  });

  // ── Start ──

  spawnInitial();
  Render.run(render);
  Runner.run(Runner.create(), engine);

  window.addEventListener('resize', function () {
    W = wrap.clientWidth;
    H = wrap.clientHeight;
    render.canvas.width = W;
    render.canvas.height = H;
    render.options.width = W;
    render.options.height = H;
    GROUND_TOP = H - 30;
    Body.setPosition(walls[0], { x: W / 2, y: GROUND_TOP + WALL_T / 2 });
    Body.setVertices(walls[0], Bodies.rectangle(W / 2, GROUND_TOP + WALL_T / 2, W + 100, WALL_T).vertices);
    Body.setPosition(walls[1], { x: W / 2, y: -WALL_T / 2 });
    Body.setVertices(walls[1], Bodies.rectangle(W / 2, -WALL_T / 2, W + 100, WALL_T).vertices);
    Body.setPosition(walls[2], { x: -WALL_T / 2, y: H / 2 });
    Body.setVertices(walls[2], Bodies.rectangle(-WALL_T / 2, H / 2, WALL_T, H + 100).vertices);
    Body.setPosition(walls[3], { x: W + WALL_T / 2, y: H / 2 });
    Body.setVertices(walls[3], Bodies.rectangle(W + WALL_T / 2, H / 2, WALL_T, H + 100).vertices);
  });
})();
