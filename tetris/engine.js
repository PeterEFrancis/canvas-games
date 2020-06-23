
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const MARGIN = 50;

const HEIGHT = 680;
const WIDTH = 400;

const NUM_SQUARES_X = 10;
const NUM_SQUARES_Y = 17;

const SQUARE_SIZE = 40;

const L = 1;
const BACK_L = 2;
const SQUARE = 3;
const LINE = 4;
const BACK_S = 5;
const S = 6;
const T = 7;
const SHAPES = [L, BACK_L, SQUARE, LINE, S, BACK_S, T];

const FULL = 8;

const COLORS = ["black", "red", "orange", "yellow", "green", "blue", "purple", "pink", "white"];

const R_0 = 0;
const R_1 = 1;
const R_2 = 2;
const R_3 = 3;
const ROTATIONS = [R_0, R_1, R_2, R_3];

const UP = -NUM_SQUARES_X;
const RIGHT = 1;
const DOWN = NUM_SQUARES_X;
const LEFT = -1;

// this is painful to look at ... the zero marks the pre-plotting offset
const PIECES = [[],
                [[UP, 2*UP, RIGHT, 0],         [DOWN, RIGHT, 2*RIGHT, 0],  [LEFT, 0, DOWN, DOWN*2],  [2*LEFT, LEFT, 0, UP],     ],   // L
                [[LEFT, UP, 2*UP, 0],          [UP, RIGHT, 2*RIGHT, 0],    [RIGHT, 0, DOWN, 2*DOWN], [2*LEFT, LEFT, 0, DOWN]    ],   // BACK_L
                [[RIGHT, RIGHT+DOWN, 0, DOWN], [LEFT, DOWN, 0, DOWN+LEFT], [LEFT+UP, UP, LEFT, 0],   [UP, UP+RIGHT, RIGHT, 0]   ],   // SQUARE
                [[UP, 2*UP, 0, DOWN],          [LEFT, RIGHT, 2*RIGHT, 0],  [UP, 0, DOWN, 2*DOWN],    [2*LEFT, LEFT, RIGHT, 0]   ],   // LINE
                [[LEFT, DOWN, 0, DOWN+RIGHT],  [LEFT+DOWN, LEFT, 0, UP],   [LEFT+UP, UP, RIGHT, 0],  [RIGHT+UP, RIGHT, 0, DOWN] ],   // BACK_S
                [[DOWN+LEFT, DOWN, 0, RIGHT],  [LEFT+UP, LEFT, 0, DOWN],   [LEFT, UP, UP+RIGHT, 0],  [UP, RIGHT, 0, RIGHT+DOWN] ],   // S
                [[LEFT, RIGHT, 0, DOWN],       [LEFT, UP, 0, DOWN],        [LEFT, UP, RIGHT, 0],     [UP, RIGHT, 0, DOWN]       ],   // T
];

const INFO_PANEL_LEFT = MARGIN + WIDTH + MARGIN / 2;

const NEXT_PIECE_LEAD_X = INFO_PANEL_LEFT + SQUARE_SIZE / 2;
const NEXT_PIECE_LEAD_Y = MARGIN + 175 + SQUARE_SIZE;



var trans = [[0, 0]];
trans[LEFT] = [-1, 0];
trans[UP] = [0, -1];
trans[RIGHT] = [1, 0];
trans[DOWN] = [0, 1];
trans[2*LEFT] = [-2, 0];
trans[2*UP] = [0, -2];
trans[2*RIGHT] = [2, 0];
trans[2*DOWN] = [0, 2];
trans[LEFT+DOWN] = [-1, 1];
trans[UP+RIGHT] = [1, -1];
trans[DOWN+RIGHT] = [1, 1];
trans[LEFT+UP] = [-1, -1];

const NEXT_PIECE_TRANSITIONS = trans;

const SHIFTS = [2, 1, .5, 0, 0];








var grid;
var current_piece_shape;
var current_piece_rotation;
var current_piece_lead_loc; // rotation fixed point
var next_piece; // [shape, rotation]
var updateID;
var dropID;
var score;
var best;
var game_over;








best = 0;

border();








function get_random_piece() {
	var shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
	var rotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
	return [shape, rotation];
}

function clone(arr) {
	var new_arr = [];
	for (var i = 0; i < arr.length; i++) {
		new_arr[i] = arr[i];
	}
	return new_arr;
}

function are_on_same_row(loc1, loc2) {
	return Math.floor(loc1 / NUM_SQUARES_X) == Math.floor(loc2 / NUM_SQUARES_X);
}

function are_on_same_side(loc1, loc2) {
	var left_1 = (loc1 % NUM_SQUARES_X) < 4;
	var left_2 = (loc2 % NUM_SQUARES_X) < 4;
	var right_1 = (loc1 % NUM_SQUARES_X) > 5;
	var right_2 = (loc2 % NUM_SQUARES_X) > 5;
	if (left_1 && right_2) {
		return false;
	}
	if (right_1 && left_2) {
		return false;
	}
	return true;
}




function rotate() {
	// check to see if the piece can rotate
	var can_rotate = true;
	if (current_piece_shape != SQUARE) {
		for (var j = 0; j < 4; j++) {
			var old_loc = current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][j];
			var new_loc = current_piece_lead_loc + PIECES[current_piece_shape][(current_piece_rotation + 1) % 4][j];
			if (grid[new_loc] > 0) { // would rotate into a set piece
				can_rotate = false;
				break;
			}
			if (new_loc > NUM_SQUARES_X * (NUM_SQUARES_Y + 4)) { // would rotate into the floor
				can_rotate = false;
				break;
			}
			if (!are_on_same_side(new_loc, old_loc)) { // would rotate into the wall
				can_rotate = false;
				break;
			}
		}
		if (can_rotate) {
			rotate_current_piece();
		}
	}
}

function rotate_current_piece() {
	// clear current moving piece from the grid
	for (var i = 0; i < NUM_SQUARES_X * (NUM_SQUARES_Y + 4); i++) {
		if (grid[i] < 0) {
			grid[i] = 0;
		}
	}
	// log the rotation in the current_piece representation
	current_piece_rotation = (current_piece_rotation + 1) % 4;
	// add the rotated piece back to the grid
	for (var j = 0; j < 4; j++) {
		grid[current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][j]] = -current_piece_shape;
	}
}



function can_move_down() {
	for (var j = 0; j < 4; j++) {
		var new_loc = current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][j] + DOWN;
		if (grid[new_loc] > 0) { // would bump into a set piece
			return false;
		}
		if (new_loc >= NUM_SQUARES_X * (NUM_SQUARES_Y + 4)) { // would bump into floor
			return false;
		}
	}
	return true;
}

function move_current_piece_down() {
	// clear the current piece
	for (var i = 0; i < 4; i++) {
		grid[current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][i]] = 0;
	}
	var can_move = can_move_down();
	if (can_move) {
		// move the current piece lead
		current_piece_lead_loc += DOWN;
	}
	// place current piece back, either temporrarily (-1) or set (1)
	for (var i = 0; i < 4; i++) {
		grid[current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][i]] = (can_move ? -1 : 1) * current_piece_shape;
	}
	return can_move;
}

function drop() {
	var still_moving = move_current_piece_down();

	// look for full lines
	for (var i = NUM_SQUARES_Y + 4 - 1; i >= 0; i--) {
		if (grid[i * NUM_SQUARES_X] == FULL) {
			for (var j = i; j > 0; j--) {
				for (var k = 0; k < NUM_SQUARES_X; k++) {
					if ((grid[(j - 1) * NUM_SQUARES_X + k] >= 0) && (grid[j * NUM_SQUARES_X + k] >= 0)) {
						grid[j * NUM_SQUARES_X + k] = grid[(j - 1) * NUM_SQUARES_X + k];
					}
				}
			}
			i++;
		}
	}


	if (!still_moving) {

		// look for pre-full lines
		for (var i = 0; i < NUM_SQUARES_Y + 4; i++) {
			var pre_full = true;
			for (var j = 0; j < NUM_SQUARES_X; j++) {
				if (grid[i * NUM_SQUARES_X + j] == 0) {
					pre_full = false;
					break;
				}
			}
			if (pre_full) {
				for (var j = 0; j < NUM_SQUARES_X; j++) {
					grid[i * NUM_SQUARES_X + j] = FULL;
				}
			}
		}



		if (block_is_in_pre()) { // game over
			if (score > best) {
				best = score;
			}
			game_over = true;
		} else {
			start_next_piece();
		}
	}
}


function block_is_in_pre() {
	for (var i = 0; i < NUM_SQUARES_X * 4; i++) {
		if (grid[i] != 0) {
			return true;
		}
	}
	return false;
}





function can_shift(direction) {
	for (var j = 0; j < 4; j++) {
		var old_loc = current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][j];
		var new_loc = old_loc + direction;
		if (grid[new_loc] > 0) { // would bump into a set piece
			return false;
		}
		if (!are_on_same_row(old_loc, new_loc)) { // would bump into wall
			return false;
		}
	}
	return true;
}

function shift(direction) {
	if (can_shift(direction)) {
		// clear the current piece
		for (var i = 0; i < 4; i++) {
			grid[current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][i]] = 0;
		}
		// move the current piece lead
		current_piece_lead_loc += direction;
		// place current piece back, either temporrarily (-1) or set (1)
		for (var i = 0; i < 4; i++) {
			grid[current_piece_lead_loc + PIECES[current_piece_shape][current_piece_rotation][i]] = -current_piece_shape;
		}
	}
}






function start_next_piece() {

	current_piece_shape = next_piece[0];
	current_piece_rotation = next_piece[1];

	var plots = PIECES[current_piece_shape][current_piece_rotation];
	console.log(plots.indexOf(0));
	current_piece_lead_loc = Math.floor(Math.random() * (NUM_SQUARES_X - 4)) + 2 + NUM_SQUARES_X * plots.indexOf(0);
	for (var i = 0; i < 4; i++) {
		grid[current_piece_lead_loc + plots[i]] = -current_piece_shape;
	}

	// increase score
	score += 1;

	// set next piece
	next_piece = get_random_piece();
}









function new_game() {

	// reset game over
	game_over = false;

	// reset score
	score = 0;

	// clear grid
	grid = [];
	for (var i = 0; i < NUM_SQUARES_X * (NUM_SQUARES_Y + 4); i++) {
		grid[i] = 0;
	}

	// get current and next piece
	next_piece = get_random_piece();

	// place first piece
	start_next_piece();

	// start drop loop
	clearInterval(dropID);
	dropID = setInterval(drop, 1000);

	// start update loop
	clearInterval(updateID);
	updateID = setInterval(update, 10);
}





function border() {
	// draw rectangle
	ctx.strokeStyle = "blue";
	ctx.lineWidth = 5;
	ctx.strokeRect(MARGIN,MARGIN,WIDTH,HEIGHT);
}




function report() {
	// test
	var test = document.getElementById('test');
	test.innerHTML = "<br><br><br><br><br>";
	for (var i = 0; i < 4 + NUM_SQUARES_Y; i++) {
		for (var j = 0; j < NUM_SQUARES_X; j++) {
			test.innerHTML += (grid[i * NUM_SQUARES_X + j] + "   ").slice(0,2) + "&emsp;&emsp;";
		}
		test.innerHTML += "<br>";
		if (i == 3) {
			test.innerHTML += "-------------------------------------<br>"
		}
	}
}


function update() {
	// clear display
	ctx.clearRect(0,0,canvas.width, canvas.height);

	// Score
	ctx.fillStyle = "white";
	ctx.font = "20pt Arial";
	ctx.fillText("Score: " + score, INFO_PANEL_LEFT, MARGIN + 20);


	// Best
	ctx.fillStyle = (score >= best && best != 0) ? "red" : "white";
	ctx.font = "20pt Arial";
	ctx.fillText("Best: " + best, INFO_PANEL_LEFT, MARGIN + 60);


	// draw blocks
	for (var i = 4 * NUM_SQUARES_X; i < NUM_SQUARES_X * (NUM_SQUARES_Y + 4); i++) {
		var top_left_x = (i % NUM_SQUARES_X) * (SQUARE_SIZE);
		var top_left_y = (Math.floor(i / NUM_SQUARES_X) - 4) * (SQUARE_SIZE);
		ctx.fillStyle = ["black", "red", "orange", "yellow", "green", "blue", "purple", "pink", "white"][Math.abs(grid[i])];
		ctx.fillRect(MARGIN + top_left_x, MARGIN + top_left_y, SQUARE_SIZE, SQUARE_SIZE);
	}

	// draw gridlines
	ctx.fillStyle = "black";
	for (var i = 0; i <= NUM_SQUARES_X; i++) {
		ctx.fillRect(MARGIN + i * SQUARE_SIZE - 1, MARGIN - 1, 2, HEIGHT);
	}
	for (var i = 0; i < NUM_SQUARES_Y + 1; i++) {
		ctx.fillRect(MARGIN, MARGIN + i * SQUARE_SIZE - 1, WIDTH, 2);
	}

	// border
	border();

	// next piece
	ctx.fillStyle = "white";
	ctx.font = "20pt Arial";
	ctx.fillText("Next:", INFO_PANEL_LEFT, MARGIN + 150);
	var next_shape = next_piece[0];
	var next_rotation = next_piece[1];
	var dirs = PIECES[next_shape][next_rotation];
	var x_dirs = [];
	var y_dirs = [];
	for (var i = 0; i < 4; i++) {
		x_dirs[i] = NEXT_PIECE_TRANSITIONS[dirs[i]][0];
		y_dirs[i] = NEXT_PIECE_TRANSITIONS[dirs[i]][1];
	}
	var shift_x = Math.abs(Math.min(...x_dirs));
	var range_x = Math.max(...x_dirs) - Math.min(...x_dirs);
	var shift_y = Math.abs(Math.min(...y_dirs));
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;
	for (var i = 0; i < 4; i++) {
		var x_offset = SQUARE_SIZE * (x_dirs[i] + shift_x + SHIFTS[range_x]);
		var y_offset = SQUARE_SIZE * (y_dirs[i] + shift_y);
		ctx.fillStyle = COLORS[next_shape];
		ctx.fillRect(NEXT_PIECE_LEAD_X + x_offset, NEXT_PIECE_LEAD_Y + y_offset, SQUARE_SIZE, SQUARE_SIZE);
		ctx.strokeRect(NEXT_PIECE_LEAD_X + x_offset, NEXT_PIECE_LEAD_Y + y_offset, SQUARE_SIZE, SQUARE_SIZE);
	}


	if (game_over) {
		ctx.fillStyle = "rgb(100,100,100,0.5)";
		ctx.fillRect(MARGIN, MARGIN, WIDTH, HEIGHT);
		ctx.fillStyle = "white";
		ctx.font = "75pt Arial";
		ctx.fillText("GAME", 100, 300);
		ctx.fillText("OVER", 100, 500);
	}

}
