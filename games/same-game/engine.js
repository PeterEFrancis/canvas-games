
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const NUM_SQUARES_X = 30;
const NUM_SQUARES_Y = 20;

const SQUARE_SIZE = canvas.width / NUM_SQUARES_X;
if (canvas.height / NUM_SQUARES_Y != SQUARE_SIZE) {
	alert("canvas is not correctly porportioned!")
}

const COLOR_STRINGS = ["red", "green", "blue"];

const BLANK = -1;
const RED = 0;
const GREEN = 1;
const BLUE = 2;

const COLORS = [RED, GREEN, BLUE,];

var grid  = [];
var hover;

var score;
var score_add;
var game_over;

var best = 0;

new_game();


function get_random_grid() {
	var g = [];
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		g.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
	}
	return g;
}

function new_game() {
	// reset Score
	score = 0;

	// reset game_over
	game_over = false;

	// set grid randomly
	grid = get_random_grid();
}

function update() {

	// show score
	document.getElementById('score').innerHTML = score;
	document.getElementById('best').innerHTML = best > 0 ? "Best: " + best : "";
	document.getElementById('score-add').innerHTML = "";

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// hover
	if (hover != -1 && grid[hover] != BLANK) {
		ctx.fillStyle = "lightgrey";
		var same_group = get_same_group(hover);
		if (same_group.length > 1) {
			// set score add
			score_add = Math.pow(same_group.length - 2, 2);
			if (score_add > 0) {
				document.getElementById('score-add').innerHTML = " + " + score_add;
			}
			// higlight squares
			var x, y;
			for (var i = 0; i < same_group.length; i++) {
				x = (same_group[i] % NUM_SQUARES_X) * SQUARE_SIZE;
				y = Math.floor(same_group[i] / NUM_SQUARES_X) * SQUARE_SIZE;
				ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
			}
		}
	}

	// draw circles
	for (var i = 0; i < NUM_SQUARES_X; i++) {
		for (var j = 0; j < NUM_SQUARES_Y; j++) {
			if (grid[j * NUM_SQUARES_X + i] != BLANK) {
				var x = i * SQUARE_SIZE + SQUARE_SIZE / 2;
				var y = j * SQUARE_SIZE + SQUARE_SIZE / 2;
				ctx.fillStyle = COLOR_STRINGS[grid[j * NUM_SQUARES_X + i]];
				ctx.beginPath();
				ctx.arc(x, y, SQUARE_SIZE / 2.3, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	}


	// game over title
	if (game_over) {
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.font = "80px Arial";
		ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 100);
		ctx.fillText("Your Score: " + score, canvas.width / 2, canvas.height / 2 + 100);
	}

}
setInterval(update, 10);

function get_same_group(pos) {
	var already_checked = [];
	var same_group = [];
	var stack = [pos];
	while (stack.length > 0) {
		var parent = stack.pop();
		if (!already_checked.includes(parent)) {
			already_checked.push(parent);
			same_group.push(parent);
			// down row
			if (Math.floor(parent / NUM_SQUARES_X) + 1 < NUM_SQUARES_X) {
				if (grid[parent + NUM_SQUARES_X] == grid[pos]) {
					stack.push(parent + NUM_SQUARES_X);
				}
			}
			// right col
			if ((parent % NUM_SQUARES_X) < NUM_SQUARES_X - 1) {
				if (grid[parent + 1] == grid[pos]) {
					stack.push(parent + 1);
				}
			}
			// up row
			if (Math.floor(parent / NUM_SQUARES_X) - 1 >= 0) {
				if (grid[parent - NUM_SQUARES_X] == grid[pos]) {
					stack.push(parent - NUM_SQUARES_X);
				}
			}
			// left col
			if ((parent % NUM_SQUARES_X) - 1 >= 0) {
				if (grid[parent - 1] == grid[pos]) {
					stack.push(parent - 1);
				}
			}
		}
	}

	return same_group;
}

function click(pos) {
	if (grid[pos] != BLANK && !game_over) {
		var same_group = get_same_group(pos);
		if (same_group.length > 1) {
			for (var i = 0; i < same_group.length; i++) {
				grid[same_group[i]] = BLANK;
			}
			score += Math.pow(same_group.length - 2, 2);
			collapse();
			game_over = is_game_over();
			if (game_over) {
				if (score > best) {
					best = score;
				}
			}
		}
	}
}

function has_gap(g) {
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		if (grid[i] == BLANK) {
			// has above square filled in
			if (i >= NUM_SQUARES_X && g[i - NUM_SQUARES_X] != BLANK) {
				return true;
			}
			// has empty column (has bottom row empty square and there is filled to the right)
			if (i >= NUM_SQUARES_X * (NUM_SQUARES_Y - 1) && i + 1 < NUM_SQUARES_X * NUM_SQUARES_Y && grid[i + 1] != BLANK) {
				return true
			}
		}
	}
	return false;
}

function collapse() {

	while (has_gap(grid)) {
		var shifted = false;
		for (var i = 0; i < NUM_SQUARES_X * (NUM_SQUARES_Y - 1); i++) {
			if (grid[i] != BLANK && grid[i + NUM_SQUARES_X] == BLANK) {
				grid[i + NUM_SQUARES_X] = grid[i];
				grid[i] = BLANK;
				shifted = true;
				break;
			}
		}

		if (shifted) {
			continue;
		}

		for (var i = 0; i < NUM_SQUARES_X - 1; i++) {
			var all_blank_col = true;
			for (var j = 0; j < NUM_SQUARES_Y; j++) {
				if (grid[j * NUM_SQUARES_X + i] != BLANK) {
					all_blank_col = false;
					break;
				}
			}
			if (all_blank_col) {
				for (var j = 0; j < NUM_SQUARES_Y; j++) {
					grid[j * NUM_SQUARES_X + i] = grid[j * NUM_SQUARES_X + i + 1];
					grid[j * NUM_SQUARES_X + i + 1] = BLANK;
				}
			}
		}

	}
}

function is_game_over() {
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		if (grid[i] != BLANK && get_same_group(i).length > 1) {
			return false;
		}
	}
	return true;
}
