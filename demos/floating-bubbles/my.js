// plugin
Matter.use('matter-wrap');

const COLORS = ['#c5f6fa', '#d0ebff', '#d3f9d8'];
const MIN_BODY_RADIUS = 50;
const MAX_BODY_RADIUS = 100;
const FRICTION_AIR = 0.03;
const SCROLL_VELOCITY = 0.025;
const BODIES_PER_PIXEL = 0.00002;

const SCROLL_DELAY = 200;
const RESIZE_DELAY = 400;

let engine;
let render;
let runner;

let viewportWidth;
let viewportHeight;
let bodies;
let lastScrollTop;
let scrollTimeout;
let resizeTimeout;

function init() {
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight;

    lastScrollTop = document.documentElement.scrollTop;

    scrollTimeout = null;
    resizeTimeout = null;

    // engine
    engine = Matter.Engine.create();
    engine.world.gravity.y = 0;

    // render
    render = Matter.Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: viewportWidth,
            height: viewportHeight,
            wireframes: false,
            background: 'transparent'
        }
    });
    Matter.Render.run(render);

    // runner
    runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // bodies
    bodies = [];
    let totalBodies = Math.round(viewportWidth * viewportHeight * BODIES_PER_PIXEL);
    for (let i = 0; i <= totalBodies; i++) {
        bodies.push(createBody());
    }
    Matter.World.add(engine.world, bodies);
}

function shutdown() {
    render.canvas.remove();
    Matter.Engine.clear(engine);
    Matter.Render.stop(render);
    Matter.Runner.stop(runner);
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

function createBody() {
    let x = rand(0, viewportWidth);
    let y = rand(0, viewportHeight);
    let radius = rand(MIN_BODY_RADIUS, MAX_BODY_RADIUS)
    let color = COLORS[bodies.length % COLORS.length];

    return Matter.Bodies.circle(x, y, radius, {
        frictionAir: FRICTION_AIR,
        render: { fillStyle: color },
        plugin: {
            wrap: {
                min: { x: 0, y: 0 },
                max: { x: viewportWidth, y: viewportHeight }
            }
        }
    });
}

function onScrollThrottled() {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(onScroll, SCROLL_DELAY);
    }
}

function onScroll() {
    scrollTimeout = null;

    let delta = (lastScrollTop - document.documentElement.scrollTop) * SCROLL_VELOCITY;

    bodies.forEach((body) => {
        Matter.Body.setVelocity(body, {
            x: body.velocity.x + delta * rand(-0.5, 0.5),
            y: body.velocity.y + delta * rand(0.5, 1.5)
        });
    });

    lastScrollTop = document.documentElement.scrollTop;
}

function onResizeThrottled() {
    if (!resizeTimeout) {
        resizeTimeout = setTimeout(onResize, RESIZE_DELAY);
    }
}

function onResize() {
    shutdown();
    init();
}

window.addEventListener('load', function() {
    init();

    // wire events
    window.addEventListener('scroll', onScrollThrottled);
    window.addEventListener('resize', onResizeThrottled);
});
