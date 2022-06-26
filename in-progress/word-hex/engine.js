
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");


const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";



var board;
var words;

var to_time;
var remaining_seconds = -1;
var timer_ID;





var dictionary = new Trie("");
$.get("https://raw.githubusercontent.com/PeterEFrancis/canvas-games/master/games/boggle/scrabble.txt", function(txt) {
	var dict_words = txt.split("\n");
	for (var i = 0; i < dict_words.length; i++ ) {
		dictionary.push(dict_words[i].trim());
	}
	jumble();
});


function jumble() {

	board = [];
	words = [];
	stop_timer();

	var dice_order = shuffle(range(NUM_DICE));

	for (var i = 0; i < NUM_DICE; i++) {
		board.push(DICE[i][Math.floor(Math.random() * 6)]);
	}

	words = get_all_words();
	document.getElementById('words').innerHTML = words.join(", ");

	var i = 0;
	var update_ID = setInterval(function() {
		update_display(true);
		if (i > 6) {
			clearInterval(update_ID);
			update_display(false);
		} else {
			i++;
		}
	}, 50);

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
	ctx.font = "140px Arial";
	ctx.translate(x, y);
	ctx.rotate(ROTATIONS[rot]);
	ctx.fillText(text, ROTATION_TEXT_OFFSETS[rot][0], ROTATION_TEXT_OFFSETS[rot][1] + 10);
	if (["M", "W", "N", "Z"].includes(text)) {
		ctx.fillRect(ROTATION_TEXT_OFFSETS[rot][0] - SQUARE_SIZE * 0.2,
		             ROTATION_TEXT_OFFSETS[rot][1] + SQUARE_SIZE * 0.1,
		             SQUARE_SIZE * 0.4, SQUARE_SIZE * 0.04, SQUARE_SIZE * 0.02);
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


function get_string_from_locs(locs) {
	var s = "";
	for (var i = 0; i < locs.length; i++) {
		s += board[locs[i]];
	}
	return s.toLowerCase();
}





function get_all_words() {
	w = [];
	// depth first search through all possible strings
	var stack = [];
	for (var i = 0; i < NUM_DICE; i++) {
		stack.push([i]);
	}
	var parent, potent_word, state;
	while (stack.length > 0) {
		parent = stack.pop();
		potent_word = get_string_from_locs(parent);
		state = dictionary.contains(potent_word);
		if (state != 0) { // is a stem
			var surr_locs = SURROUNDINGS[parent[parent.length - 1]];
			for (var i = 0; i < surr_locs.length; i++) {
				if (!parent.includes(surr_locs[i])) {
					stack.push([...parent, surr_locs[i]]);
				}
			}
			if (state == 2) { // is a leaf
				w.push(potent_word);
			}
		}
	}
	w = [...new Set(w)];
	w.sort();
	return w;
}
