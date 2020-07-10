
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const MARGIN = canvas.width * 0.05;
const SIZE = canvas.width - 2 * MARGIN;
const LINE_WIDTH = 4;
const NUM_SQUARES = 9;
const SQUARE_SIZE = SIZE / NUM_SQUARES;
const SHAPES = {french: {pegs: [12, 13, 14, 20, 21, 22, 23, 24, 28, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 41, 42, 43, 46, 47, 48, 49, 50, 51, 52, 56, 57, 58, 59, 60, 66, 67, 68] , open: 40},
                german: {pegs: [3, 4, 5, 12, 13, 14, 21, 22, 23, 27, 28 ,29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 57, 58, 59, 66, 67, 68, 75, 76, 77], open: 40},
                asymmetric: {pegs:  [3, 4, 5, 12, 13, 14, 21, 22, 23, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49, 50, 51, 52, 53, 57, 58, 59, 66, 67, 68] , open: 40},
                english: {pegs:  [12, 13, 14, 21, 22, 23, 28, 29, 30, 31, 32, 33, 34, 37, 38, 39, 40, 41, 42, 43, 46, 47, 48, 49, 50, 51, 52, 57, 58, 59, 66, 67, 68], open: 40},
                diamond: {pegs:  [4, 12, 13, 14, 20, 21, 22, 23, 24, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 39, 40, 41,42, 43, 44, 46, 47, 48, 49, 50, 51, 52, 56, 57, 58, 59, 60, 66, 67, 68, 76], open: 40},
                triangle: {pegs: [21, 30, 31, 39, 40, 41, 48, 49, 50, 51, 57, 58, 59, 60, 61] , open: 21}};
const PEG = 1;
const NO_PEG = 0;

const GAME_OVER_WIN = 1;
const GAME_OVER_LOSE = -1;
const GAME_NOT_OVER = 0;

var board;
var shape;
var selected;
var next;
var move_history;


new_game();



function set_shape() {
	shape = document.getElementById('shape').value;
}


function get_middle(from, to) {
	var diff = Math.abs(from - to);
	if (![2, 2 * NUM_SQUARES, 2 * NUM_SQUARES - 2, 2 * NUM_SQUARES + 2].includes(diff)) {
		return -1;
	}
	// TODO: more checks ?
	return from + (to - from) / 2;
}


function is_legal_move(from, to) {
	if (board[from] == NO_PEG || board[to] == PEG) {
		return false;
	}
	// find one in the middle
	var middle = get_middle(from, to);
	if (middle == -1) {
		return false;
	}
	if (board[middle] == NO_PEG) {
		return false;
	}
	return true;
}


function is_game_over() {
	var num_remaining = 0;
	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		if (SHAPES[shape].pegs.includes(i) && board[i] == PEG) {
			num_remaining++;
			if (get_next(i).length > 0) {
				return GAME_NOT_OVER;
			}
		}
	}
	if (num_remaining == 1) {
		return GAME_OVER_WIN;
	} else {
		return GAME_OVER_LOSE;
	}
}


function click(hole_id) {
	if (SHAPES[shape].pegs.includes(hole_id)) {
		// console.log("clicked: " + hole_id + "  selected: " + selected);
		if (selected == hole_id) {
			selected = -1;
		} else if ((selected == -1 || (selected != -1 && !is_legal_move(selected, hole_id))) && board[hole_id] == PEG) {
			selected = hole_id;
		} else if (is_legal_move(selected, hole_id)) {
			board[selected] = NO_PEG;
			board[get_middle(selected, hole_id)] = NO_PEG;
			board[hole_id] = PEG;
			move_history.push([selected, hole_id]);
			selected = -1;
			var go = is_game_over();
			if (go != GAME_NOT_OVER) {
				document.getElementById('message').innerHTML = "Game Over -- " + (go == GAME_OVER_WIN ? "You Win!" : "You Lose");
			}
		}
		update_display();
	}
}


function undo() {
	if (move_history.length > 0) {
		var last = move_history.pop();
		board[last[0]] = PEG;
		board[get_middle(last[0], last[1])] = PEG;
		board[last[1]] = NO_PEG;
		selected = last[0];
		update_display();
		document.getElementById('message').innerHTML = "&emsp;";
	}
}

function get_next(loc) {
	n = [];
	if (loc != -1) {
		for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
			if (is_legal_move(loc, i) && SHAPES[shape].pegs.includes(i)) {
				n.push(i);
			}
		}
	} else {
		n = [];
	}
	return n;
}

function set_next() {
	next = get_next(selected);
}



function update_display() {

	set_next();

	// clear the display
	ctx.clearRect(0,0,canvas.width, canvas.height);

	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		if (SHAPES[shape].pegs.includes(i)) {
			var x = MARGIN + (i % NUM_SQUARES) * SQUARE_SIZE + SQUARE_SIZE/2;
			var y = MARGIN + Math.floor(i / NUM_SQUARES) * SQUARE_SIZE + SQUARE_SIZE/2;
			ctx.fillStyle = board[i] == 1 ? "#e4c595" : "black";

			if (next.includes(i)) {
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowBlur = 20;
				ctx.shadowColor = "#a00";
			} else if (i == selected) {
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = 0;
				ctx.shadowBlur = 20;
				ctx.shadowColor = "white";
			} else {
				if (board[i] == 1) {
					ctx.shadowBlur = 20;
					ctx.shadowColor = "black";
					ctx.shadowOffsetX = 8;
					ctx.shadowOffsetY = 8;
				} else {
					ctx.shadowBlur = 0;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
				}
			}
			ctx.beginPath();
			ctx.arc(x, y, SQUARE_SIZE * 0.15, 2 * Math.PI, false);
			ctx.fill();

		}
	}
	ctx.shadowBlur = 0;

}


function new_game() {

	document.getElementById('message').innerHTML = "&emsp;";

	set_shape();

	board = [];
	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		if (SHAPES[shape].pegs.includes(i) && SHAPES[shape].open != i) {
			board.push(PEG)
		} else {
			board.push(NO_PEG);
		}
	}

	// de-select
	selected = -1;

	// reset move_history
	move_history = [];

	update_display();
}
