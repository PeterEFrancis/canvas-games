
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even


var num_squares = 5;
var square_size = SIZE / num_squares;
var board = [];

var starting_square = null;
var ending_square = null;
var placed_squares = [];







function change_num_squares(amount) {
	if (num_squares + amount > 0) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		reset_game();
	}
}

function get_square_coords(square_id) {
	let r = Math.floor(square / num_squres);
	let c = squre_id % num_squares;
	return {
		x: canvas.width * c / num_squares,
		y: canvas.height * r / num_squares
	}
}



function draw_square(start, end, color) {
	ctx.fillStyle = color;
	ctx.fillRect(get_square_coords(start).x, get_square_coords(end).y, square_size, square_size);
}



function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	// add the grid lines
	ctx.fillStyle = "white";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2, SIZE, LINE_WIDTH);
		ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
		// yes, one of these falls over the edge and doesn't get displayed, but that is ok
	}

	// draw rectangles

}



function reset_game() {

	// make a new (blank) board array
	board = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		board.push(0);
	}

	// clear variables
	var starting_square = null;
	var ending_square = null;
	var placed_squares = [];


	// generate rect groups
	

	// update display
	update_display()
}





function get_square_id(event) {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	var row = Math.floor(user_y / (SIZE / num_squares));
	var col = Math.floor(user_x / (SIZE / num_squares));
	return row* num_squares + col;
}






canvas.addEventListener('mousedown', function() {
	starting_square = get_square_id(event);
	update_display();
});

canvas.addEventListener('hover', function() {
	hover_square = get_square_id(event);
	update_display();
});

canvas.addEventListener('mouseup', function() {
	ending_square = get_square_id(event);
	update_display();
});






















