
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even

const MOVES = [[0,0], [0,1], [1,0], [-1,0], [0,-1]];



var num_squares = 5;
var square_size = SIZE / num_squares;
var board = [];
var color;






function update_color() {
	color = document.getElementById('color').value;
	update_display();
}



function change_num_squares(amount) {
	if (num_squares + amount > 0) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		reset_game();
	}
}



function click(square_id) {
	var row = Math.floor(square_id / num_squares);
	var col = square_id % num_squares;

	for (var i = 0; i < 5; i++) {
		var move = MOVES[i];
		if (move[0] + row < num_squares && move[0] + row >= 0 && move[1] + col < num_squares && move[1] + col >= 0) {
			var new_square_num = (row + move[0]) * num_squares + col + move[1];
			board[new_square_num] = 1 - board[new_square_num];
		}
	}
}



function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	ctx.fillStyle = color;
	for (var i = 0; i < num_squares * num_squares; i++) {
		if (board[i] == 1) {
			var top_left_x = (i % num_squares) * (square_size);
			var top_left_y = (Math.floor(i / num_squares)) * (square_size);
			ctx.fillRect(top_left_x, top_left_y, square_size, square_size);
		}
	}

	// add the grid lines
	ctx.fillStyle = "white";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2, SIZE, LINE_WIDTH);
		ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
		// yes, one of these falls over the edge and doesn't get displayed, but that is ok
	}

}



function reset_game() {

	// make a new (blank) board array
	board = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		board.push(0);
	}

	// generate solvable pattern
	for (var i = 0; i < num_squares * num_squares; i++) {
		if (Math.random() < 0.5) {
			click(i);
		}
	}

	// show lights (does both)
	update_color();

}



function chase_lights() {
	for (var i = num_squares; i < num_squares * num_squares; i++) {
		if (board[i - num_squares] == 1) {
			click(i);
		}
	}
	update_display();
}



function clear_board() {
	console.log("clear");
	for (var i = 0; i < num_squares * num_squares; i++) {
		board[i] = 0;
	}
	update_display();
}








canvas.addEventListener('click', function() {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	var row = Math.floor(user_y / (SIZE / num_squares));
	var col = Math.floor(user_x / (SIZE / num_squares));
	click(row * num_squares + col);
	update_display();
});
