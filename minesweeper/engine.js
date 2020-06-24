
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even

MINE_PERCENTAGE = 0.25;

const BLANK = 1;
const MINE = 2;
const BLANK_FLAG = -3
const MINE_FLAG = -4;

const MODE_FLAG = 1;
const MODE_CLICK = 0;

function is_blank(square_id) {
	return Math.abs(board[square_id]) == BLANK;
}
function is_mine(square_id) {
	return [MINE, -MINE, MINE_FLAG, -MINE_FLAG].includes(board[square_id]);
}
function is_flagged(square_id) {
	return Math.abs(board[square_id]) > MINE;
}
function is_uncovered(square_id) {
	return board[square_id] > 0;
}
function uncover(square_id) {
	board[square_id] = Math.abs(board[square_id]);
}
function flag(square_id) {
	num_flags_left -= 1;
	board[square_id] = is_mine(square_id) ? MINE_FLAG : BLANK_FLAG;
}
function un_flag(square_id) {
	num_flags_left += 1;
	board[square_id] = board[square_id] == MINE_FLAG ? -MINE : -BLANK;
}




var num_squares = 10;
var square_size = SIZE / num_squares;
var board = [];
var mode;
var clicked_mine;
var num_flags_left;






function change_num_squares(amount) {
	if (num_squares + amount > 3) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		new_game();
	}
}


function toggle_mode() {
	var btn = document.getElementById('mode');
	if (mode == MODE_FLAG) {
		mode = MODE_CLICK;
		btn.children[0].style.color = "red";
		btn.style.backgroundColor = "white";
	} else {
		mode = MODE_FLAG;
		btn.children[0].style.color = "white";
		btn.style.backgroundColor = "red";

	}


}



function get_neighbors(square_id) {
	var neighbors = [];
	for (var j = -1; j < 2; j++) {
		for (var k = -1; k < 2; k++) {
			if (j == 0 && k == 0) {
				continue;
			}
			var i = num_squares * j + k + square_id;
			if (Math.abs((i % num_squares) - (square_id % num_squares)) > 1) {
				continue;
			}
			if (i < 0 || i > num_squares * num_squares) {
				continue;
			}
			neighbors.push(i);
		}
	}
	return neighbors;
}


function get_num_surrounding_mines(square_id) {
	var neighbors = get_neighbors(square_id);
	var num = 0;
	for (var i = 0; i < neighbors.length; i++) {
		if (is_mine(neighbors[i])) {
			num += 1;
		}
	}
	return num;
}


function uncover_empty_squares(square_id) {
	uncover(square_id);
	if (get_num_surrounding_mines(square_id) == 0) {
		var neighbors = get_neighbors(square_id);
		for (var i = 0; i < neighbors.length; i++) {
			var neighbor = neighbors[i];
			if (!is_uncovered(neighbor) && !is_mine(neighbor)) {
				uncover_empty_squares(neighbor);
			}
		}
	}
}


function is_game_over() {
	if (clicked_mine != -1) {
		return true;
	}
	var num_mines = 0;
	var num_covered = 0
	for (var i = 0; i < num_squares * num_squares; i++) {
		if (!is_uncovered(i)) {
			num_covered += 1;
		}
		if (is_mine(i)) {
			num_mines += 1;
		}
	}

	if (num_covered == num_mines) {
		return true;
	}
	return false;
}


function end_game(won) {
	if (won) {
		for (var i = 0; i < num_squares * num_squares; i++) {
			if (!is_uncovered(i)) {
				flag(i);
			}
		}
		document.getElementById('alert').innerHTML = "You Won!";
	} else {
		for (var i = 0; i < num_squares * num_squares; i++) {
			if (is_mine(i) && !is_flagged(i)) {
				uncover(i);
			}
		}
		document.getElementById('alert').innerHTML = "You lose :(";
	}
	update_display();
}







function get_square_id(e) {
	var rect = canvas.getBoundingClientRect();
	var user_x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	var row = Math.floor(user_y / (SIZE / num_squares));
	var col = Math.floor(user_x / (SIZE / num_squares));
	return row * num_squares + col;
}


function handle_click(square_id) {
	if (!is_flagged(square_id) && !is_game_over()) {
		if (is_mine(square_id)) {
			clicked_mine = square_id;
			end_game(false);
		} else {
			uncover_empty_squares(square_id);
			update_display();
			if (is_game_over()) {
				end_game(true);
			}
		}
	}
}


function handle_right_click(square_id) {
	if (!is_uncovered(square_id) && !is_game_over()) {
		if (is_flagged(square_id)) {
			un_flag(square_id);
		} else {
			flag(square_id);
		}
		update_display();
		if (is_game_over()) {
			end_game(true);
		}
	}
}


canvas.addEventListener('click', function(e) {
	if (mode == MODE_FLAG) {
		handle_right_click(get_square_id(e));
	} else {
		handle_click(get_square_id(e));
	}
});


canvas.addEventListener('contextmenu', function(e) {
	e.preventDefault();
	handle_right_click(get_square_id(e));
	return false;
}, false);










function new_game() {

	// reset clicked mine
	clicked_mine = -1;

	// make a new (blank) board array
	board = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		board.push(-BLANK);
	}

	// reset num flags left
	num_flags_left = Math.ceil(num_squares * num_squares * MINE_PERCENTAGE);

	// place mines
	var mines = [];
	while (mines.length < num_flags_left) {
		mines.push(Math.floor(Math.random() * num_squares * num_squares));
		mines = [...(new Set(mines))];
	}
	for (var i = 0; i < mines.length; i++) {
			board[mines[i]] = -MINE;
	}

	// reset alert
	document.getElementById('alert').innerHTML = "";

	// reset mode
	var btn = document.getElementById('mode');
	mode = MODE_CLICK;
	btn.style.color = "red";
	btn.style.backgroundColor = "white";

	update_display();

}







// function end_game() {
// 	if (clicked_mine != -1) { // lost
// 		for (var i = 0; i < num_squares * num_squares; i++) {
// 			if (is_mine(i)) {
// 				uncover(i);
// 			}
// 		}
// 	} else { // won
// 		for (var i = 0; i < num_squares * num_squares; i++) {
// 			if (is_mine(i)) {
// 				flag(i);
// 			}
// 		}
// 	}
// 	update_display()
// }










function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);
	for (var i = 0; i < num_squares * num_squares; i++) {

		var x = (i % num_squares) * (square_size);
		var y = Math.floor(i / num_squares) * (square_size);


		// draw square
		if (is_uncovered(i)) {
			ctx.fillStyle = "lightgrey";
		} else {
			ctx.fillStyle = "grey";
		}
		if (i == clicked_mine) {
			ctx.fillStyle = "red";
		}
		ctx.fillRect(x, y, square_size, square_size);

		var size = 0.6;
		var text = "";

		// draw icon
		if (is_uncovered(i)) {
			if (is_mine(i)) {
				text = "💣";
				size = 0.4;
			} else {
				text = get_num_surrounding_mines(i);
				ctx.fillStyle = ["lightgrey", "blue", "green", "red", "orange", "purple", "brown", "yellow", "grey"][text];
			}
		} else {
			if (is_flagged(i)) {
				ctx.fillStyle = "red";
				text = "⚑";
			}
		}
		ctx.font = (square_size * size) + "pt monospace";
		ctx.fillText(text, x + 0.25 * square_size, y + square_size * 0.8);

		// set numbder of flags left
		document.getElementById('flags-left').innerHTML = num_flags_left;

		// add admin text
		// ctx.fillStyle = "black";
    // ctx.font = (square_size * 0.15) + "pt arial";
    // ctx.fillText(board[i], (i % num_squares) * square_size + 5, (Math.floor(i / num_squares) + 1) * square_size - 5);
	}

	// add the grid lines
	ctx.fillStyle = "white";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2, SIZE, LINE_WIDTH);
		ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
		// yes, one of these falls over the edge and doesn't get displayed, but that is ok
	}

}
