
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const HEIGHT = canvas.height;
const WIDTH = canvas.width;
const SQUARE_SIZE = 60;
const NUM_ROWS = HEIGHT / SQUARE_SIZE;
const NUM_COLS = WIDTH / SQUARE_SIZE;
const LINE_WIDTH = 2; // works best if this is even
const INNER_SQUARE_SIZE = SQUARE_SIZE - LINE_WIDTH;

var blank = true;

// add the grid lines
ctx.fillStyle = "lightgrey";
for (var i = 0; i <= Math.max(NUM_ROWS, NUM_COLS) + 1; i++) {
	ctx.fillRect(0 - LINE_WIDTH / 2, i * SQUARE_SIZE - LINE_WIDTH / 2, WIDTH, LINE_WIDTH);
	ctx.fillRect(i * SQUARE_SIZE - (LINE_WIDTH / 2), 0, LINE_WIDTH, HEIGHT);
	// yes, one of these falls over the edge and doesn't get displayed, but that is ok
}



function reset_game(row, col) {

	// place regular cookies
	var cookie = new Image();
	cookie.src = "cookie.png";
	cookie.onload = function () {
		for (var i = 0; i <= col; i++) {
			for (var j = 0; j <= row; j++) {
				var x = i * SQUARE_SIZE + (LINE_WIDTH / 2);
				var y = j * SQUARE_SIZE + (LINE_WIDTH / 2);
				ctx.drawImage(cookie, x, y, INNER_SQUARE_SIZE, INNER_SQUARE_SIZE);
			}
		}
	}

	// poison
	var poison_cookie = new Image();
	poison_cookie.src = "cookie-skull.png";
	poison_cookie.onload = function () {
		ctx.drawImage(poison_cookie, LINE_WIDTH / 2, LINE_WIDTH / 2, INNER_SQUARE_SIZE, INNER_SQUARE_SIZE);
	}

	// reset blank
	blank = false;

}



function game_step() {
	// get the square number that was clicked
	var rect = canvas.getBoundingClientRect();
	var user_x = event.clientX - rect.left;
	var user_y = event.clientY - rect.top;
	var row = Math.floor(user_y / SQUARE_SIZE);
	var col = Math.floor(user_x / SQUARE_SIZE);

	if (blank) {
		reset_game(row, col);
	}	else {
		// set all squares black that are below and to the right
		for (var i = col; i < NUM_COLS; i++) {
			for (var j = row; j < NUM_ROWS; j++) {
				var x = i * SQUARE_SIZE + (LINE_WIDTH / 2);
				var y = j * SQUARE_SIZE + (LINE_WIDTH / 2);
				ctx.clearRect(x, y, INNER_SQUARE_SIZE, INNER_SQUARE_SIZE);
			}
		}

		blank = (row * NUM_COLS + col == 0);

	}


}
