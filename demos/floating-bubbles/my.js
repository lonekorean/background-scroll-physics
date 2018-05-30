window.addEventListener('load', function() {
    // plugins
    Matter.use(MatterWrap);

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    let floatingBodies = [];
    let lastScrollTop = document.documentElement.scrollTop;
    let scrollTimeout = null;
    let engineUpdateTimeout = null;
    let resizeTimeout = null;

    // matter.js has a built in random range function, but it is deterministic
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function wall(x, y, width, height) {
        return Matter.Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            render: {
                fillStyle: '#868e96'
            }
        });
    }

    // creates a randomized floating body
    function floatingBody() {
        let x = rand(0, viewportWidth);
        let y = rand(0, viewportHeight);

        let color = ['#c5f6fa', '#d0ebff', '#d3f9d8'][floatingBodies.length % 3];

        return Matter.Bodies.circle(x, y, rand(50, 100), {
            frictionAir: 0.03,
            render: {
                fillStyle: color
            },
            plugin: {
                wrap: {
                    min: { x: 0, y: 0 },
                    max: { x: viewportWidth, y: viewportHeight }
                }
            }
        });
    }

    // throttle scrolling
    function onScrollThrottled() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(onScroll, 200);
        }
    }

    // push bodies around depending on scroll
    function onScroll() {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;

        let delta = (lastScrollTop - document.documentElement.scrollTop) / 40;
        floatingBodies.forEach((body) => {
            Matter.Body.setVelocity(body, {
                x: body.velocity.x + delta * rand(-0.5, 0.5),
                y: body.velocity.y + delta * rand(0.5, 1.5)
            });
        });

        lastScrollTop = document.documentElement.scrollTop;
    }

    // throttle resize window
    function onResizeThrottled() {
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(onResize, 400);
        }
    }

    // cheap fix if viewport changes, start over! (obviously demo purposes only)
    function onResize() {
        window.location.reload();
    }

    // engine
    let engine = Matter.Engine.create();
    engine.world.gravity.y = 0;

    // render
    let render = Matter.Render.create({
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
    let runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // add a number of floating bodies appropriate for amount of screen space
    let floatingBodiesCount = Math.round(viewportWidth * viewportHeight / 50000);
    for (let i = 0; i <= floatingBodiesCount; i++) {
        floatingBodies.push(floatingBody());
    }
    Matter.World.add(engine.world, floatingBodies);

    // wire events
    window.addEventListener('scroll', onScrollThrottled);
    window.addEventListener('resize', onResizeThrottled);
});
