
// msome of the maze generation code adapted from Todd Neller



const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");


const UNREACHED = 0;
const REACHED = 1;
const SOLUTION_PATH = 2;
const HIDDEN_SOLUTION_PATH = 3;

const RIGHT = 0;
const UP = 1;
const LEFT = 2;
const DOWN = 3;

const DIRECTIONS = [RIGHT, UP, LEFT, DOWN];
const ROW_CHANGE = [0, -1, 0, 1];
const COL_CHANGE = [1, 0, -1, 0];

const COLORS = ["black", "white", "rgb(0,255,0)", "white"];

const SQUARE_SIZE = 10;

var rows;
var cols;
var grid;
var open_right;
var open_left;
var solved = false;
var generating;
var player_pos = [0,0];


generate();



function create_array(r, c, fill) {
	var a = [];
	for (var i = 0; i < r; i++) {
		var b = [];
		for (var j = 0; j < c; j++) {
			b[j] = fill;
		}
		a[i] = b;
	}
	return a;
}

function shuffle(a) {
	var array = [...a];
	let counter = array.length;
	while (counter > 0) {
		var index = Math.floor(Math.random() * counter);
		counter--;
		var temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}



function is_unreached(row, col, dir) {
	var row2 = row + ROW_CHANGE[dir];
	var col2 = col + COL_CHANGE[dir];
	return (row2 >= 0 && row2 < rows && col2 >= 0 && col2 < cols && grid[row2][col2] == UNREACHED);
}

function open_wall(row, col, dir) {
	var row2 = row + ROW_CHANGE[dir];
	var col2 = col + COL_CHANGE[dir];
	// console.log("   row2 = " + row2);
	// console.log("   col2 = " + col2);
	if (row == row2) {
		open_right[row][col < col2 ? col : col2] = true;
	} else {
		open_down[row < row2 ? row : row2][col] = true;
	}
}

function can_travel(row, col, dir) {
	var row2 = row + ROW_CHANGE[dir];
	var col2 = col + COL_CHANGE[dir];
	return ((row2 >= 0) && (row2 < rows) && (col2 >= 0) && (col2 < cols) &&
	 ((row == row2 && open_right[row][col < col2 ? col : col2]) || (col == col2 && open_down[row < row2 ? row : row2][col])));
}



function generate() {

	solved = false;
	generating = true;

	var rows_el = document.getElementById('rows');
	var cols_el = document.getElementById('cols');

	if (isNaN(rows_el.value) || Number(rows_el.value) < 3) {
		rows_el.value = 30;
	}
	if (isNaN(cols_el.value) || Number(cols_el.value) < 3) {
		cols_el.value = 30;
	}

	rows = Number(rows_el.value);
	cols = Number(cols_el.value);

	grid = create_array(rows, cols, 0);
	open_right = create_array(rows, cols - 1, false);
	open_down = create_array(rows - 1, cols, false);

	make_DF_maze();

	update_display();
	generating = false;
}

function make_DF_maze() {
	maze_step(0,0);

	// var stack = [[0,0]];
	// while (stack.length > 0) {
	// 	var top = stack.pop();
	// 	var row = top[0];
	// 	var col = top[1];
	// 	grid[row][col] = REACHED;
	// 	if (row != 0 || col != 0) {
	// 		var dir = top[2];
	// 		open_wall(row + ROW_CHANGE[dir], col + COL_CHANGE[dir], dir);
	// 	}
	// 	var dirs = shuffle(DIRECTIONS);
	// 	for (var i = 0; i < 4; i++) {
	// 		var dir = dirs[i];
	// 		if (is_unreached(row, col, dir)) {
	// 			stack.push([row, col, dir]);
	// 		}
	// 	}
	// }
}

function maze_step(row, col) {
	grid[row][col] = REACHED;
	var dirs = shuffle(DIRECTIONS);
	for (var i = 0; i < 4; i++) {
		var dir = dirs[i];
		if (is_unreached(row, col, dir)) {
			open_wall(row, col, dir);
			maze_step(row + ROW_CHANGE[dir], col + COL_CHANGE[dir]);
		}
	}
}



function toString() {
	var grid_chars = ['#', '&emsp;', '.'];
	var out_grid = create_array(2 * rows + 1, 2 * cols + 1, 0);
	for (var r = 0; r < rows; r++) {
		for (var c = 0; c < cols; c++) {
			var r2 = 2 * r + 1;
			var c2 = 2 * c + 1;
			out_grid[r2][c2] = grid[r][c];
			if (can_travel(r, c, RIGHT)) {
				out_grid[r2][c2 + 1] = (grid[r][c] == grid[r][c + 1]) ? grid[r][c] : REACHED;
			}
			if (can_travel(r, c, DOWN)) {
				out_grid[r2 + 1][c2] = (grid[r][c] == grid[r + 1][c]) ? grid[r][c] : REACHED;
			}
		}
	}
	out_grid[0][1] = out_grid[1][1]; // upper left opening
	out_grid[2 * rows][2 * cols - 1] = out_grid[2 * rows - 1][2 * cols - 1]; // lower right opening
	var s = "";
	for (var r = 0; r < out_grid.length; r++) {
		for (var c = 0; c < out_grid[r].length; c++) {
			s += grid_chars[out_grid[r][c]];
		}
		s += '<br>';
	}
	return s;
}

function update_display() {

	// change the canvas display
	canvas.width = SQUARE_SIZE * (2 * cols + 1);
	canvas.height = SQUARE_SIZE * (2 * rows + 1);

	// get output grid
	var out_grid = create_array(2 * rows + 1, 2 * cols + 1, 0);
	for (var r = 0; r < rows; r++) {
		for (var c = 0; c < cols; c++) {
			var r2 = 2 * r + 1;
			var c2 = 2 * c + 1;
			out_grid[r2][c2] = grid[r][c];
			if (can_travel(r, c, RIGHT)) {
				out_grid[r2][c2 + 1] = (grid[r][c] == grid[r][c + 1]) ? grid[r][c] : REACHED;
			}
			if (can_travel(r, c, DOWN)) {
				out_grid[r2 + 1][c2] = (grid[r][c] == grid[r + 1][c]) ? grid[r][c] : REACHED;
			}
		}
	}
	out_grid[0][1] = out_grid[1][1]; // upper left opening
	out_grid[2 * rows][2 * cols - 1] = out_grid[2 * rows - 1][2 * cols - 1]; // lower right opening

	// draw to canvas
	for (var r = 0; r < out_grid.length; r++) {
		for (var c = 0; c < out_grid[r].length; c++) {
			ctx.fillStyle = COLORS[out_grid[r][c]];
			ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
		}
	}

	ctx.fillStyle = "red";
	ctx.beginPath();
	var x = (player_pos[1] * 2 + 1) * SQUARE_SIZE + SQUARE_SIZE / 2;
	var y = (player_pos[0] * 2 + 1) * SQUARE_SIZE + SQUARE_SIZE / 2;
	ctx.arc(x, y, SQUARE_SIZE/3, 0, 2 * Math.PI, false);
	ctx.fill();

	// document.getElementById('test').innerHTML = toString();


}



function toggle_solution() {
	if (!generating) {
		if (!solved) {
			solve();
		} else {
			for (var r = 0; r < rows; r++) {
				for (var c = 0; c < cols; c++) {
					if (grid[r][c] >= SOLUTION_PATH) {
						grid[r][c] = SOLUTION_PATH + HIDDEN_SOLUTION_PATH - grid[r][c];
					}
				}
			}
		}
		update_display();
	}
}

function solve() {
	solve_step(0,0);
	solved = true;
}

function solve_step(row, col) {
	grid[row][col] = SOLUTION_PATH;
	if (row == rows - 1 && col == cols - 1) {
		return true;
	} else {
		for (var i = 0; i < 4; i++) {
			var dir = DIRECTIONS[i];
			if (can_travel(row, col, dir)) {
				var row2 = row + ROW_CHANGE[dir];
				var col2 = col + COL_CHANGE[dir];
				if (grid[row2][col2] != SOLUTION_PATH) {
					if (solve_step(row2, col2)) {
						return true;
					}
				}
			}
		}
		grid[row][col] = REACHED;
		return false;
	}
}



function move(dir) {
	if (can_travel(player_pos[0], player_pos[1], dir)) {
		player_pos = [player_pos[0] + ROW_CHANGE[dir], player_pos[1] + COL_CHANGE[dir]];
		update_display();
	}
}
