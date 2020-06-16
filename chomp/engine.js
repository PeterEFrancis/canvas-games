
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const HEIGHT = canvas.height;
const WIDTH = canvas.width;
const SQUARE_SIZE = 100;
const NUM_ROWS = HEIGHT / SQUARE_SIZE;
const NUM_COLS = WIDTH / SQUARE_SIZE;
const LINE_WIDTH = 2; // works best if this is even
const INNER_SQUARE_SIZE = SQUARE_SIZE - LINE_WIDTH;

var game_over;


reset_game();


function reset_game() {

		// reset game_over
		game_over = false;

    // clear board
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

		// place cookies
		// regular
		var cookie = new Image();
		cookie.src = "cookie.png";
		cookie.onload = function () {
			for (var i = 0; i < NUM_COLS; i++) {
				for (var j = 0; j < NUM_ROWS; j++) {
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

    // add the grid lines
    ctx.fillStyle = "lightgrey";
    for (var i = 0; i <= 5; i++) {
      ctx.fillRect(0 - LINE_WIDTH / 2, i * SQUARE_SIZE - LINE_WIDTH / 2, WIDTH, LINE_WIDTH);
      ctx.fillRect(i * SQUARE_SIZE - (LINE_WIDTH / 2), 0, LINE_WIDTH, HEIGHT);
      // yes, one of these falls over the edge and doesn't get displayed, but that is ok
    }
}



function game_step() {

		if (game_over) {
			reset_game();
		}

		else {
			// get the square number that was clicked
	    var rect = canvas.getBoundingClientRect();
	    var user_x = event.clientX - rect.left;
	    var user_y = event.clientY - rect.top;
	    var row = (user_y - (user_y % SQUARE_SIZE)) / SQUARE_SIZE;
	    var col = (user_x - (user_x % SQUARE_SIZE)) / SQUARE_SIZE;
	    var square_num = row * NUM_COLS + col;

			// set all squares black that are above and to the right

			for (var i = col; i < NUM_COLS; i++) {
				for (var j = row; j < NUM_ROWS; j++) {
					var x = i * SQUARE_SIZE + (LINE_WIDTH / 2);
					var y = j * SQUARE_SIZE + (LINE_WIDTH / 2);
					ctx.clearRect(x, y, INNER_SQUARE_SIZE, INNER_SQUARE_SIZE);
				}
			}

			game_over = (square_num == 0);

		}


}
