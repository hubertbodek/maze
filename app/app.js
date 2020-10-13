const game = function(){
	const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

	const cellsX = 20;
	const cellsY = 14;
	const width = window.innerWidth;
	const height = window.innerHeight;
	const unitLengthX = width / cellsX;
	const unitLengthY = height / cellsY;
	
	
	
	const engine = Engine.create();
	engine.world.gravity.y =0;
	const { world } = engine;
	const render = Render.create({
		element: document.body,
		engine,
		options: {
			wireframes: false,
			width,
			height,
			background: '#305F72'
		},
	});
	Render.run(render);
	Runner.run(Runner.create(), engine);
	
	//Walls
	const walls = [
		Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }), //top
		Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }), //bot
		Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }), //left
		Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }), //right
	];
	World.add(world, walls);
	
	//MAZE GENERATION
	
	const shuffle = (arr) => {
		//shuffling function
		let counter = arr.length;
	
		while (counter > 0) {
			const index = Math.floor(Math.random() * counter);
	
			counter--;
			const temp = arr[counter];
			arr[counter] = arr[index];
			arr[index] = temp;
		}
		return arr;
	};
	
	//GRID
	const grid = Array(cellsY)
		.fill(null)
		.map(function () {
			return Array(cellsX).fill(false);
		});
	// RETURNS [ F, F, F ] ex. for 3x3
	//        [ F, F, F ]
	//        [ F, F, F ]
	
	//VERTICALS
	const verticals = Array(cellsY)
		.fill(null)
		.map(function () {
			return Array(cellsX - 1).fill(false);
		});
	// RETURNS [ F, F ] ex. for 3x3
	//         [ F, F ]
	//         [ F, F ]
	
	//HORIZONTALS
	const horizontals = Array(cellsY - 1)
		.fill(null)
		.map(function () {
			return Array(cellsX).fill(false);
		});
	// RETURNS [ F, F, F ] ex. for 3x3
	//         [ F, F, F ]
	
	const startRow = Math.floor(Math.random() * cellsY);
	const startCol = Math.floor(Math.random() * cellsX);
	
	const stepThroughCell = (row, column) => {
		// if i have visited the cell at [row,col], then return
		if (grid[row][column] === true) 
		{
			return
		};
		// mark this cell as visited -> true
		grid[row][column] = true;
		// assemble randomly ordered list of neighbors
		const neighbors = shuffle([
			[row - 1, column, "up"],
			[row, column + 1, "right"],
			[row + 1, column, "down"],
			[row, column - 1, "left"], //top dd//right //bottom
		]);
	
		for (let neighbor of neighbors) {
			const [nextRow, nextColumn, direction] = neighbor;
	
			// see if that neighbor is out of bounds
			if (nextRow < 0 || nextRow >= cellsY || nextColumn < 0 || nextColumn >= cellsX) {
				continue;
			}
			// if we have visited that neighbor, continue to next neighbor
			if (grid[nextRow][nextColumn]) {
				continue;
			}
			// remove a wall from either horizontals or vertivals
			if (direction === "left") {
				verticals[row][column - 1] = true;
			} else if (direction === "right") {
				verticals[row][column] = true;
			} else if (direction === "up") {
				horizontals[row - 1][column] = true;
			} else if (direction === "down") {
				horizontals[row][column] = true;
			}
	
			stepThroughCell(nextRow, nextColumn);
			// visit that next cell
	
		}
	};
	
	stepThroughCell(startRow, startCol);
	
	horizontals.forEach((row, rowIndex)=>{
		row.forEach((open, columnIndex)=>{
			if(open){
				return;
			}
	
			const wall = Bodies.rectangle(
				columnIndex * unitLengthX + unitLengthX /2,
				rowIndex * unitLengthY + unitLengthY,
				unitLengthX,
				4,
				{
					isStatic:true,
					label: 'wall',
					render: {
						fillStyle: '#568EA6'
					}
				}
			)
				World.add(world,wall)
		})
	})
	
	verticals.forEach((row, rowIndex)=>{
		row.forEach((open, columnIndex)=>{
			if(open){
				return;
			}
	
			const wall= Bodies.rectangle(
				columnIndex * unitLengthX + unitLengthX,
				rowIndex * unitLengthY + unitLengthY/2,
				4,
				unitLengthY,
				{
					isStatic: true,
					label: 'wall',
					render: {
						fillStyle: '#568EA6'
					}
				}
			)
			World.add(world,wall)
		})
	})
	
	//Goal
	const goal = Bodies.rectangle(
		width - unitLengthX/2,
		height - unitLengthY/2,
		unitLengthX*0.7,
		unitLengthY*0.7,
		{
			isStatic: true,
			label: "goal",
			render: {
				fillStyle: '#F18C8E'
			}
		}
	)
	
	const ballRadius = Math.min(unitLengthX, unitLengthY)*0.3
	const ball = Bodies.circle(
		unitLengthX/2,
		unitLengthY/2,
		ballRadius,
		{
			label: "ball",
			render: {
				fillStyle: '#F0B7A4'
			}
		}
	)
	
	World.add(world,goal)
	World.add(world,ball)
	
	//MOVEMENT
	document.addEventListener('keydown', e =>{
	let {x,y} = ball.velocity;
	
		if (e.code === "KeyW"){
			Body.setVelocity(ball, {x, y: y - 5})
		} 
		if (e.code === "KeyS"){
			Body.setVelocity(ball, {x, y: y + 5})
		} 
		if (e.code === "KeyA"){
			Body.setVelocity(ball, {x: x - 5, y})
		} 
		if (e.code === "KeyD"){
			Body.setVelocity(ball, {x: x + 5, y})
		} 
	})
	
	
	Events.on(engine, 'collisionStart', e => {
		e.pairs.forEach(collision=>{
			if (collision.bodyA.label === "goal" && collision.bodyB.label === "ball"){
				document.querySelector('.win').classList.remove('hidden')
				engine.world.gravity.y = 1;
				world.bodies.forEach((body) =>{
					if(body.label === "wall"){
						Body.setStatic(body, false);
					}
				})
			}
			
		})})

		document.querySelector('.playAgain').addEventListener('click', e =>{
			e.preventDefault();
			World.clear(world);
			Engine.clear(engine);
			Render.stop(render);
			render.canvas.remove();
			game();
			document.querySelector('.win').classList.add('hidden')
		})
}


document.addEventListener('DOMContentLoaded', ()=>{
	game();
})

