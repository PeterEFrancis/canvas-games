
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const NONE = 0;

const NUM_SQUARES = 9;
const SQUARE_SIZE = canvas.width / NUM_SQUARES;

const LINE_WIDTH_THIN = 2;
const LINE_WIDTH_THICK = 8;

var groups = [];
var h_group, v_group, s_group;
for (var i = 0; i < NUM_SQUARES; i++) {
	h_group = [];
	v_group = [];
	s_group = [];
	for (var j = 0; j < NUM_SQUARES; j++) {
		h_group.push(i * NUM_SQUARES + j);
		v_group.push(j * NUM_SQUARES + i);
		s_group.push(3 * ((i % 3) + 9 * Math.floor(i / 3)) + (j % 3) + 9 * Math.floor(j / 3));
	}
	groups.push(h_group, v_group, s_group);
}
const GROUPS = groups;



var diff = 50/81;


var board;
var solution;
var shown;
var selected_square_id;



new_game();


function new_game() {

	solution = get_sudoko_grid();
	board = [...solution];
	var el;
	for (var i = 0; i < Math.floor(diff * NUM_SQUARES * NUM_SQUARES); i++) {
		do {
			loc = Math.floor(Math.random() * NUM_SQUARES * NUM_SQUARES);
		} while (board[loc] == NONE);
		board[loc] = NONE;
	}
	shown = [...board];

	selected_square_id = -1;

	update_display();
}


function place(num) {
	if (selected_square_id != -1 && (shown[selected_square_id] == NONE || (num == NONE && shown[selected_square_id] == NONE))) {
		board[selected_square_id] = num;
		update_display();
	}
}


function get_sudoko_grid() {
	var root = {grid:[], depth:0};
	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		root.grid.push(0);
	}
	var stack = [root];
	while (stack.length > 0) {
		var parent = stack.pop();
		if (parent.depth == NUM_SQUARES * NUM_SQUARES) {
			return parent.grid;
		}
		stack.push(...shuffle(get_children(parent)));
	}
}


function get_children(parent) {
	var child;
	var children = [];
	for (var j = 1; j < NUM_SQUARES + 1; j++) {
		if (can_place(j, parent.grid, parent.depth)) {
			child = {grid: [...parent.grid], depth: parent.depth + 1};
			child.grid[parent.depth] = j;
			children.push(child);
		}
	}
	return children;
}


function can_place(num, grid, loc) {
	// iterate through all of the groups that contain loc
	// if any one of the groups contains a location loc2 for which grid[loc2] == num, return false
	// otherwise, return true
	for (var i = 0; i < GROUPS.length; i++) {
		if (GROUPS[i].includes(loc)) {
			for (var j = 0; j < NUM_SQUARES; j++) {
				if (grid[GROUPS[i][j]] == num) {
					return false;
				}
			}
		}
	}
	return true;
}


function shuffle(a) {
	var j, x, i;
	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}



function show_solution() {
	board = [...solution];
	update_display();
}



function hint() {
	if (!is_solved(board)) {
		var loc;
		do {
			loc = Math.floor(Math.random() * NUM_SQUARES * NUM_SQUARES);
		} while (board[loc] != NONE);
		board[loc] = solution[loc];
	}
	update_display();
}


function is_solved(b) {
	for (var i = 0; i < GROUPS.length; i++) {
		var s = [];
		for (var j = 0; j < NUM_SQUARES; j++) {
			if (b[GROUPS[i][j]] == NONE) {
				return false;
			}
			s.push(b[GROUPS[i][j]]);
		}
		if ((new Set(s)).size != 9) {
			return false;
		}
	}
	return true;
}




function update_display() {
	// clear the display
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		if (board[i] != 0) {
			var x = (i % NUM_SQUARES) * SQUARE_SIZE;
			var y = Math.floor(i / NUM_SQUARES) * SQUARE_SIZE;
			ctx.fillStyle = "black";
			ctx.font = (shown[i] == NONE ? "" : "bold ") + "75px monospace";
			ctx.fillText(board[i], x + SQUARE_SIZE * 0.3, y + SQUARE_SIZE * 0.7);
		}
	}

	// add the grid lines
	ctx.fillStyle = "black";
	for (var i = 0; i <= NUM_SQUARES + 1; i++) {
		var lw = i % 3 == 0 ? LINE_WIDTH_THICK : LINE_WIDTH_THIN;
		ctx.fillRect(0 - lw / 2, i * SQUARE_SIZE - lw / 2, canvas.width, lw);
		ctx.fillRect(i * SQUARE_SIZE - (lw / 2), 0, lw, canvas.width);
	}

	// add selected square shadow
	if (selected_square_id != -1) {
		var x = (selected_square_id % NUM_SQUARES) * SQUARE_SIZE;
		var y = Math.floor(selected_square_id / NUM_SQUARES) * SQUARE_SIZE;
		ctx.shadowBlur = 8;
		ctx.shadowColor = "blue";
		ctx.lineWidth = 3;
		ctx.strokeRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
	}
	ctx.shadowBlur = 0;

}






canvas.addEventListener('click', function() {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	var row = Math.floor(user_y / (canvas.width / NUM_SQUARES));
	var col = Math.floor(user_x / (canvas.width / NUM_SQUARES));
	selected_square_id = row * NUM_SQUARES + col;
	update_display();
});
