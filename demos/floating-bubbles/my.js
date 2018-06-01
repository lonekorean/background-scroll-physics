// plugin
Matter.use('matter-wrap');

let floatingBubbles = {
	// customizable options (passed into init function)
    options: {
        canvasSelector: '',
        colors: ['#c5f6fa', '#d0ebff', '#d3f9d8'],
        minBodyRadius: 50,
        maxBodyRadius: 100,
        airFriction: 0.03,
        scrollVelocity: 0.025,
        bodiesPerPixel: 0.00002
    },

	// throttling intervals (in ms)
	scrollDelay: 100,
	resizeDelay: 400,

	// throttling variables and timeouts
	lastScrollTop: undefined,
	scrollTimeout: undefined,
	resizeTimeout: undefined,

	// Matter.js objects
	engine: undefined,
	render: undefined,
	runner: undefined,
	bodies: undefined,

	// kicks things off
	init(options) {
		// override default options with incoming options
		this.options = Object.assign(this.options, options);

		let viewportWidth = document.documentElement.clientWidth;
		let viewportHeight = document.documentElement.clientHeight;

		this.lastScrollTop = document.documentElement.scrollTop;
		this.scrollTimeout = null;
		this.resizeTimeout = null;
	
		// engine
		this.engine = Matter.Engine.create();
		this.engine.world.gravity.y = 0;
	
		// render
		this.render = Matter.Render.create({
			canvas: document.querySelector(this.options.canvasSelector),
			engine: this.engine,
			options: {
				width: viewportWidth,
				height: viewportHeight,
				wireframes: false,
				background: 'transparent'
			}
		});
		Matter.Render.run(this.render);
	
		// runner
		this.runner = Matter.Runner.create();
		Matter.Runner.run(this.runner, this.engine);
	
		// bodies
		this.bodies = [];
		let totalBodies = Math.round(viewportWidth * viewportHeight * this.options.bodiesPerPixel);
		for (let i = 0; i <= totalBodies; i++) {
			let body = this.createBody(viewportWidth, viewportHeight);
			this.bodies.push(body);
		}
		Matter.World.add(this.engine.world, this.bodies);

		// events
		window.addEventListener('scroll', this.onScrollThrottled.bind(this));
		window.addEventListener('resize', this.onResizeThrottled.bind(this));
	},
	
	// stop all the things
	shutdown() {
		Matter.Engine.clear(this.engine);
		Matter.Render.stop(this.render);
		Matter.Runner.stop(this.runner);

		window.removeEventListener('scroll', this.onScrollThrottled);
		window.removeEventListener('resize', this.onResizeThrottled);
	},
	
	// random number generator
	rand(min, max) {
		return Math.random() * (max - min) + min;
	},
	
	// create body with some random parameters
	createBody(viewportWidth, viewportHeight) {
		let x = this.rand(0, viewportWidth);
		let y = this.rand(0, viewportHeight);
		let radius = this.rand(this.options.minBodyRadius, this.options.maxBodyRadius)
		let color = this.options.colors[this.bodies.length % this.options.colors.length];
	
		return Matter.Bodies.circle(x, y, radius, {
			frictionAir: this.options.airFriction,
			render: { fillStyle: color },
			plugin: {
				wrap: {
					min: { x: 0, y: 0 },
					max: { x: viewportWidth, y: viewportHeight }
				}
			}
		});
	},
	
	// enforces throttling of scroll handler
	onScrollThrottled() {
		if (!this.scrollTimeout) {
			this.scrollTimeout = setTimeout(this.onScroll.bind(this), this.scrollDelay);
		}
	},
	
	// applies velocity to bodies based on scrolling with some randomness
	onScroll() {
		this.scrollTimeout = null;
	
		let delta = (this.lastScrollTop - document.documentElement.scrollTop) * this.options.scrollVelocity;
	
		this.bodies.forEach((body) => {
			Matter.Body.setVelocity(body, {
				x: body.velocity.x + delta * this.rand(-0.5, 0.5),
				y: body.velocity.y + delta * this.rand(0.5, 1.5)
			});
		});
	
		this.lastScrollTop = document.documentElement.scrollTop;
	},
	
	// enforces throttling of resize handler
	onResizeThrottled() {
		if (!this.resizeTimeout) {
			this.resizeTimeout = setTimeout(this.onResize.bind(this), this.resizeDelay);
		}
	},
	
	// restart everything with the new viewport size
	onResize() {
		this.shutdown();
		this.init();
	}
}

window.addEventListener('DOMContentLoaded', () => {
	Object.create(floatingBubbles).init({
        canvasSelector: '#bg'
    });
});
