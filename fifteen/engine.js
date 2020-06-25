
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even





var num_squares = 4;
var square_size = SIZE / num_squares;
var board = [];
var locations = [];





function change_num_squares(amount) {
	if (num_squares + amount > 1 && num_squares + amount < 11) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		solve();
	}
}




function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}





function click(square_id) {
	var row = Math.floor(square_id / num_squares);
	var col = square_id % num_squares;

	// find empty square
	var empty = board.indexOf(0);
	var empty_row = Math.floor(empty / num_squares);
	var empty_col = empty % num_squares;

	var vec = 0;
	if (empty_row == row) {
		vec = (col - empty_col) / Math.abs(col - empty_col);
	} else if (empty_col == col) {
		vec = num_squares * (row - empty_row) / Math.abs(row - empty_row);
	} else {
		return;
	}

	var i = empty;
	while (i != square_id) {
		board[i] = board[i += vec];
	}
	board[i] = 0;
	update_display();
}


function solve() {
	board = [];
	for (var i = 1; i < num_squares * num_squares; i++) {
		board.push(i);
	}
	board.push(0);
	update_display();
}


function randomize() {
	for (var i = 0; i < 500; i++) {
		click(Math.floor(Math.random() * num_squares * num_squares));
	}
	update_display();
}





function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	for (var i = 0; i < num_squares * num_squares; i++) {
		if (board[i] != 0) {
			ctx.fillStyle = ["tan", "maroon"][board[i] % 2];
			var x = (i % num_squares) * square_size;
			var y = Math.floor(i / num_squares) * square_size;
			roundRect(ctx, x + 5, y + 5, square_size - 10, square_size - 10, square_size * 0.2, true, false)
			ctx.fillStyle = "rgb(220,220,220)";
			ctx.font = (square_size * 0.65) + "px monospace";
			ctx.fillText(board[i], x + (square_size * (0.3 - ((board[i] + "").length - 1) * 0.19)), y + (square_size * 0.7));
		}
	}

	// add the grid lines
	ctx.fillStyle = "silver";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2, SIZE, LINE_WIDTH);
		ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
		// yes, one of these falls over the edge and doesn't get displayed, but that is ok
	}

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
