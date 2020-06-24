
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const NUM_SQUARES = 20;

const SQUARE_SIZE = canvas.width / NUM_SQUARES;

const COLORS = ["red", "orange", "yellow", "green", "blue", "purple"];

const RED = 0;
const ORANGE = 1;
const YELLOW = 2;
const GREEN = 3;
const BLUE = 4;
const PURPLE = 5;








var grid;
var floods;




function flood(color) {
	floods += 1;
	var same_color = [];
	var stack = [0];
	while (stack.length > 0) {
		var p = stack.pop();
		same_color.push(p);
		if (Math.floor(p / NUM_SQUARES) + 1 < NUM_SQUARES && grid[p + NUM_SQUARES] == grid[0]) {
			stack.push(p + NUM_SQUARES);
		}
		if ((p % NUM_SQUARES) < NUM_SQUARES - 1 && grid[p + 1] == grid[0]) {
			stack.push(p + 1);
		}
	}

	for (var i = 0; i < same_color.length; i++) {
		grid[same_color[i]] = color;
	}
	update();
}




function new_game() {
	// reset floods
	floods = 0;

	// clear grid
	grid = [];

	// set grid randomly
	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		grid[i] = Math.floor(Math.random() * (PURPLE + 1));
	}

	// update display
	update();

}




function update() {

	// clear display
	ctx.clearRect(0,0,canvas.width, canvas.height);

	// floods
	document.getElementById('floods').innerHTML = floods;

	// draw blocks
	for (var i = 0; i < NUM_SQUARES; i++) {
		for (var j = 0; j < NUM_SQUARES; j++) {
			var x = i * SQUARE_SIZE;
			var y = j * SQUARE_SIZE;
			ctx.fillStyle = COLORS[grid[i * NUM_SQUARES + j]];
			ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
		}
	}

}
