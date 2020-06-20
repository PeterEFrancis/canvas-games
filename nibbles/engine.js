
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const HEIGHT = canvas.height;
const WIDTH = canvas.width;

const NUM_SQUARES_X = 32;
const SQUARE_SIZE = WIDTH / NUM_SQUARES_X;
const NUM_SQUARES_Y = HEIGHT / (SQUARE_SIZE);

if (NUM_SQUARES_Y % 1 != 0) {
	console.log("problem with number of squares y")
}

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const KEY_DIRS = [KEY_LEFT, KEY_UP, KEY_RIGHT, KEY_DOWN];

const BOARD_LEFT = -1;
const BOARD_UP = -NUM_SQUARES_X;
const BOARD_RIGHT = 1;
const BOARD_DOWN = NUM_SQUARES_X;

const BOARD_DIRS = [BOARD_LEFT, BOARD_UP, BOARD_RIGHT, BOARD_DOWN];

const APPLE = -1;

const SCORE_DISP = document.getElementById('score-disp');





var board;
var direction;
var length;
var moveID;
var updateID;
var is_game_playing;
var delay = 200;



document.addEventListener('keydown', function(event) {
	if (KEY_DIRS.includes(event.keyCode)) {
		var dir = BOARD_DIRS[Number(event.keyCode) - KEY_LEFT];
		change_direction(dir);
	}
});

function change_direction(dir) {
	if (is_game_playing) {
		if (board[board.indexOf(length) + dir] <= 0) {
			if (Math.abs(dir) != Math.abs(direction)) {
				direction = dir;
			}
		}
	}
}

document.addEventListener('change', function(event) {
	delay = Number(document.getElementById('delay').value);
	clearInterval(moveID);
	moveID = setInterval(move_snake, delay);
});



function is_on_board(i, move) {
	var col = i % NUM_SQUARES_X;
	if ((move == BOARD_RIGHT) && (col + 1 >= NUM_SQUARES_X)) {
		return false;
	}
	if ((move == BOARD_LEFT) && (col - 1 < 0)) {
		return false;
	}
	var row = Math.floor(i / NUM_SQUARES_X);
	if ((move == BOARD_UP) && (row - 1 < 0)) {
		return false;
	}
	if ((move == BOARD_DOWN) && (row + 1 >= NUM_SQUARES_Y)) {
		return false;
	}
	return true;
}

function clone_arr(arr) {
	var copied = [];
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		copied[i] = arr[i];
	}
	return copied;
}

function next_apple() {
	var next_app = 0;
	do {
		next_app = Math.floor(Math.random() * NUM_SQUARES_X * NUM_SQUARES_Y);
	} while (board[next_app] != 0);
	return next_app;
}


function move_snake() {
	var copied_board = clone_arr(board);
	var extension = 0;
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		if (board[i] > 0) {
			if (board[i] == length) {
				if (is_on_board(i, direction) && board[i + direction] <= 0) {
					if (board[i + direction] == APPLE) {
						copied_board[next_apple()] = APPLE;
						length += 1;
					}
					copied_board[i + direction] = length + 1;
					for (var j = 0; j < NUM_SQUARES_X * NUM_SQUARES_Y; j++) {
						if (copied_board[j] > 0) {
							copied_board[j] = copied_board[j] - 1;
						}
					}
				} else {
					is_game_playing = false;
					clearInterval(moveID);
					break;
				}
			}
		}
	}
	board = copied_board;
}


function update() {

	// clear the display
	ctx.clearRect(0,0,WIDTH,HEIGHT);

	// add squares
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		ctx.fillStyle = is_game_playing ? "rgb(" + (((length - board[i]) * 25.5) % 255) + ",255,0)" : "rgb(0,0,255)";
		if (board[i] != 0) {
			if (board[i] == APPLE) {
				ctx.fillStyle = "rgb(255,0,0)";
			}
			var top_left_x = (i % NUM_SQUARES_X) * (SQUARE_SIZE);
			var top_left_y = (Math.floor(i / NUM_SQUARES_X)) * (SQUARE_SIZE);
			ctx.fillRect(top_left_x, top_left_y, SQUARE_SIZE, SQUARE_SIZE);
			if (board[i] == length) {
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(top_left_x + SQUARE_SIZE / 2, top_left_y + SQUARE_SIZE / 2, SQUARE_SIZE/5, 0, 2 * Math.PI, false);
				ctx.fill();
				ctx.fillStyle = "black";
				ctx.beginPath();
				ctx.arc(top_left_x + SQUARE_SIZE / 2, top_left_y + SQUARE_SIZE / 2, SQUARE_SIZE/14, 0, 2 * Math.PI, false);
				ctx.fill();
			}
		}
	}

	// add the grid lines
	ctx.fillStyle = "rgb(5,5,5)";
	for (var i = 0; i <= NUM_SQUARES_X + 1; i++) {
		ctx.fillRect(i * (WIDTH / NUM_SQUARES_X) - 1, 0 - 1, 2, HEIGHT);
	}
	for (var i = 0; i < NUM_SQUARES_Y + 1; i++) {
		ctx.fillRect(0, i * (HEIGHT / NUM_SQUARES_Y) - 1, WIDTH, 2);
	}

	// update score
	SCORE_DISP.innerHTML = length - 1;

}


function new_game() {

	clearInterval(moveID);

	// set game state
	is_game_playing = true;

	// make a new (blank) board array
	board = [];
	for (var i = 0; i < NUM_SQUARES_X * NUM_SQUARES_Y; i++) {
		board.push(0);
	}

	// set length
	length = 1;

	// set direction
	direction = BOARD_RIGHT;

	// place starting piece
	board[NUM_SQUARES_X * Math.floor(NUM_SQUARES_Y /  2) + Math.floor(NUM_SQUARES_Y / 4)] = length;
	board[next_apple()] = APPLE;

	updateID = setInterval(update, 5);
	moveID = setInterval(move_snake, delay);
}
