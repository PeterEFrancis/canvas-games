
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const NONE = 0;
const LINE_WIDTH = 6;
const NUM_SQUARES = 4;
const SQUARE_SIZE = canvas.width / NUM_SQUARES;
const NUM_DICE = NUM_SQUARES * NUM_SQUARES;
const DICE = [["R", "I", "F", "O", "B", "X"],
              ["I", "F", "E", "H", "E", "Y"],
              ["D", "E", "N", "O", "W", "S"],
              ["U", "T", "O", "K", "N", "D"],
              ["H", "M", "S", "R", "A", "O"],
              ["L", "U", "P", "E", "T", "S"],
              ["A", "C", "I", "T", "O", "A"],
              ["Y", "L", "G", "K", "U", "E"],
              ["Qu", "B", "M", "J", "O", "A"],
              ["E", "H", "I", "S", "P", "N"],
              ["V", "E", "T", "I", "G", "N"],
              ["B", "A", "L", "I", "Y", "T"],
              ["E", "Z", "A", "V", "N", "D"],
              ["R", "A", "L", "E", "S", "C"],
              ["U", "W", "I", "L", "R", "G"],
              ["P", "A", "C", "E", "M", "D"]]
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const RANDOM_OFFSET = 10;
const ROTATIONS = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
const ROTATION_TEXT_OFFSETS = [[SQUARE_SIZE * 0.5, SQUARE_SIZE * 0.65],
                               [SQUARE_SIZE * 0.5, -SQUARE_SIZE * 0.35],
                               [-SQUARE_SIZE * 0.5, -SQUARE_SIZE * 0.35],
                               [-SQUARE_SIZE * 0.5, SQUARE_SIZE * 0.65]];


var num_squares;
var board;

var to_time;
var remaining_seconds = -1;
var timer_ID;


jumble();




function jumble() {

	board = [];

	var dice_order = shuffle(range(NUM_DICE));

	for (var i = 0; i < NUM_DICE; i++) {
		board.push(DICE[i][Math.floor(Math.random() * 6)]);
	}

	var i = 0;
	var update_ID = setInterval(function() {
		update_display(true);
		if (i == 10) {
			clearInterval(update_ID);
			update_display(false);
		} else {
			i++;
		}
	}, 50);

	update_display();

}



function range(n) {
	var r = [];
	for (var i = 0; i < n; i++) {
		r.push(i);
	}
	return r;
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

function draw_die(ctx, x, y, rot, text) {
	ctx.fillStyle = "white";
	ctx.shadowBlur = 15;
	ctx.shadowColor = "black";
	ctx.shadowOffsetX = 5;
	ctx.shadowOffsetY = 5;
	roundRect(ctx, x + SQUARE_SIZE * 0.1, y + SQUARE_SIZE * 0.1, SQUARE_SIZE * 0.8, SQUARE_SIZE * 0.8, 40, true, false);
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur = 0;
	ctx.textAlign = "center";
	ctx.fillStyle = "black";
	ctx.font = "140px monospace";
	ctx.translate(x, y);
	ctx.rotate(ROTATIONS[rot]);
	ctx.fillText(text, ROTATION_TEXT_OFFSETS[rot][0], ROTATION_TEXT_OFFSETS[rot][1]);
	if (text == "M" || text == "W") {
		roundRect(ctx, ROTATION_TEXT_OFFSETS[rot][0] - SQUARE_SIZE * 0.2,
		               ROTATION_TEXT_OFFSETS[rot][1] + SQUARE_SIZE * 0.05,
		               SQUARE_SIZE * 0.4, SQUARE_SIZE * 0.04, SQUARE_SIZE * 0.02, true, false);
	}
	ctx.rotate(-ROTATIONS[rot]);
	ctx.translate(-x, -y);

}



function update_display(should_randomize) {
	// clear the display
	ctx.clearRect(0, 0, canvas.width, canvas.height);


	// draw board
	ctx.fillStyle = "lightblue";
	roundRect(ctx, 0, 0, canvas.width, canvas.height, 15, true, false);


	// draw dice and numbers
	for (var i = 0; i < NUM_DICE; i++) {
		var x = (i % NUM_SQUARES) * SQUARE_SIZE;
		var y = Math.floor(i / NUM_SQUARES) * SQUARE_SIZE;
		if (should_randomize) {
			x += Math.random() * 2 * RANDOM_OFFSET - RANDOM_OFFSET;
			y += Math.random() * 2 * RANDOM_OFFSET - RANDOM_OFFSET;
		}
		var text = board[i];
		if (should_randomize) {
			text = LETTERS[Math.floor(Math.random() * LETTERS.length)];
		}
		var rot = Math.floor(Math.random() * 4);

		draw_die(ctx, x, y, rot, text);
	}

}




function get_time_string(seconds) {
	var minutes = Math.floor(seconds / 60);
	var minutes_str = "" + minutes;
	seconds -= minutes * 60;
	var seconds_str = "" + seconds;
	if (seconds < 10) {
		seconds_str = "0" + seconds_str;
	}
	return minutes_str + ":" + seconds_str ;
}


function start_timer() {

	var d = new Date();

	if (remaining_seconds == -1) {
		remaining_seconds = 3 * 60;
	}

	to_time = Math.floor(Number(d.getTime()) / 1000) + remaining_seconds;

	timer_ID = setInterval(function() {
		var d = new Date();
		remaining_seconds = to_time - Math.floor(Number(d.getTime()) / 1000);

		if (remaining_seconds < 0) {
			stop_timer();
			alert("Timer done!");
		} else {
			document.getElementById('time').innerHTML = get_time_string(remaining_seconds);
		}

	}, 10);

}


function pause_timer() {
	clearInterval(timer_ID);
}


function stop_timer() {
	document.getElementById('time').innerHTML = "3:00";
	remaining_seconds = -1;
	clearInterval(timer_ID);
}
