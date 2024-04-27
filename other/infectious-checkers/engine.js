
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;
const LINE_WIDTH = 1; // works best if this is even

const MOVES = [[0,0], [0,1], [1,0], [-1,0], [0,-1]];



var num_squares = 5;
var square_size = SIZE / num_squares;
var board = [];
var color = 'green';
var p;




function change_num_squares(amount) {
	if (num_squares + amount > 0) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		reset_game();
	}
}


function randomize() {
	p = Number(document.getElementById('p').value);
	for (let i = 0; i < num_squares ** 2; i++) {
		if (Math.random() < p) {
			board[i] = 1;
		} else {
			board[i] = 0;
		}
	}
	update_display();
}


function click(square_id) {
	board[square_id] = 1 - board[square_id];
}



function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	let max = Math.max(...board);

	for (var i = 0; i < num_squares * num_squares; i++) {
		let color = 'rgb(0, ' + JSON.stringify(max == 0 ? 0 : (200 * board[i] / max) + 55)  + ', 0)';
		ctx.fillStyle = board[i] == 0 ? 'red' : color;

		var top_left_x = (i % num_squares) * (square_size);
		var top_left_y = (Math.floor(i / num_squares)) * (square_size);
		ctx.fillRect(top_left_x, top_left_y, square_size, square_size);
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

	update_display();
}



function get_num_neighbors(square_id) {
	let ret = 0;
	let r = Math.floor(square_id / num_squares);
	let c = square_id % num_squares;
	if (r > 0) {
		ret += board[(r - 1) * num_squares + c] > 0;
	}
	if (r < num_squares - 1) {
		ret += board[(r + 1) * num_squares + c] > 0;
	}
	if (c > 0) {
		ret += board[r * num_squares + ( c - 1)] > 0;
	}
	if (c < num_squares - 1) {
		ret += board[r * num_squares + (c + 1)] > 0;
	}
	return ret;
}




function step() {
	let count = 0;
	let new_board = [];
	for (i = 0; i < num_squares ** 2; i++) {
		new_board[i] = board[i];
		if (board[i] > 0) {
			new_board[i] += 1;
		}
		if (get_num_neighbors(i) >= 2) {
			new_board[i] += 1;
			if (board[i] == 0) {
				count += 1;
			}
		}

	}
	board = new_board;
	return count;
}

function play() {
	let intervalID = setInterval(function() {
		count = step();
		update_display();
		if (count == 0) {
			clearInterval(intervalID);
		}
	}, 300)
	
}



function clear_board() {
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
