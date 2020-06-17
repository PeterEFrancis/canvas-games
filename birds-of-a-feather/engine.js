
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



//                              _                     _
//  ___    ___    _ __    ___  | |_    __ _   _ __   | |_   ___
// / __|  / _ \  | '_ \  / __| | __|  / _` | | '_ \  | __| / __|
// | (__  | (_) | | | | | \__ \ | |_  | (_| | | | | | | |_  \__ \
// \___|  \___/  |_| |_| |___/  \__|  \__,_| |_| |_|  \__| |___/


const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const CARD_WIDTH = 100;
const CARD_HEIGHT = 150;
const CARD_MARGIN_X = 10;
const CARD_MARGIN_Y = 10;
const CARD_GRID_MARGIN_X = 45;
const CARD_GRID_MARGIN_Y = 45;
const CARD_LOCATIONS_X = [];
const CARD_LOCATIONS_Y = [];
for (var i = 0; i < 4; i++) {
	CARD_LOCATIONS_X.push(CARD_GRID_MARGIN_X + (CARD_WIDTH + 2 * CARD_MARGIN_X) * i);
	CARD_LOCATIONS_Y.push(CARD_GRID_MARGIN_Y + (CARD_HEIGHT + 2 * CARD_MARGIN_Y) * i);
}
const MOVES = [[1, 2, 3, 4, 8, 12],[0, 2, 3, 5, 9, 13],[0, 1, 3, 6, 10, 14],[0, 1, 2, 7, 11, 15],[0, 5, 6, 7, 8, 12],[1, 4, 6, 7, 9, 13],[2, 4, 5, 7, 10, 14],[3, 4, 5, 6, 11, 15],[0, 4, 9, 10, 11, 12],[1, 5, 8, 10, 11, 13],[2, 6, 8, 9, 11, 14],[3, 7, 8, 9, 10, 15],[0, 4, 8, 13, 14, 15],[1, 5, 9, 12, 14, 15],[2, 6, 10, 12, 13, 15],[3, 7, 11, 12, 13, 14]];




//   __   _          _       _
//  / _| (_)   ___  | |   __| |  ___
// | |_  | |  / _ \ | |  / _` | / __|
// |  _| | | |  __/ | | | (_| | \__ \
// |_|   |_|  \___| |_|  \__,_| |___/


var clicking;
var clicked_card_num;
var clicked_card_ID;
var hover_xy;
var hover_card_offset_xy;
var hover_card_ID;
var card_grid;
var history_moves; // ... [from_num, to_num, hidden_card_ID] ...




//                                                _
//  _ __     __ _    __ _    ___     ___    ___  | |_   _   _   _ __
// | '_ \   / _` |  / _` |  / _ \   / __|  / _ \ | __| | | | | | '_ \
// | |_) | | (_| | | (_| | |  __/   \__ \ |  __/ | |_  | |_| | | |_) |
// | .__/   \__,_|  \__, |  \___|   |___/  \___|  \__|  \__,_| | .__/
// |_|              |___/                                      |_|


reset_game();

canvas.addEventListener('mousedown', function(evt) {
  var rect = canvas.getBoundingClientRect();
  var x = evt.clientX - rect.left;
  var y = evt.clientY - rect.top;
	var cn = get_card_num(x, y);
	if (cn != -1) {
		if (card_grid[cn] != -1) {
			clicking = true;
			clicked_card_num = cn;
			clicked_card_ID = card_grid[cn];
			hover_card_ID = card_grid[cn];
			card_grid[cn] = -1;
			hover_card_offset_xy = [x - CARD_LOCATIONS_X[cn % 4], y - CARD_LOCATIONS_Y[Math.floor(cn / 4)]];
		}
	}
});

canvas.addEventListener('mousemove', function(evt) {
  var rect = canvas.getBoundingClientRect();
  var x = evt.clientX - rect.left;
  var y = evt.clientY - rect.top;
  hover_xy = [x,y];
});

window.addEventListener('mouseup', function(evt) {
	var rect = canvas.getBoundingClientRect();
	var x = evt.clientX - rect.left;
	var y = evt.clientY - rect.top;
	clicking = false;
	var cn = get_card_num(x, y);
	if (is_legal_move(clicked_card_ID, clicked_card_num, card_grid[cn], cn) && hover_card_ID != -1) {
		// add to history
		history_moves.push([clicked_card_num, cn, card_grid[cn]]);
		// move card
		card_grid[cn] = hover_card_ID;
		hover_card_ID = -1;
	} else {
		// put it back
		card_grid[clicked_card_num] = hover_card_ID;
	}
});

document.addEventListener('keydown', function(event) {
    if (event.keyCode == 90 && history_moves.length > 0) {
			var last = history_moves.pop();
			var from_num = last[0];
			var to_num = last[1];
			var hidden_card_ID = last[2];
			card_grid[from_num] = card_grid[to_num];
			card_grid[to_num] = hidden_card_ID;
		}
} );





//  _              _
// | |__     ___  | |  _ __     ___   _ __   ___
// | '_ \   / _ \ | | | '_ \   / _ \ | '__| / __|
// | | | | |  __/ | | | |_) | |  __/ | |    \__ \
// |_| |_|  \___| |_| | .__/   \___| |_|    |___/
//                    |_|



function is_legal_move(c1, cn1, c2, cn2) {
	if (c1 == -1 || c2 == -1) {
		return false;
	}
	var same_row = Math.floor(cn1 / 4) == Math.floor(cn2 / 4);
	var same_col = cn1 % 4 == cn2 % 4;
	var adj_rank = are_adj_rank(c1, c2);
	var same_suit = (Math.floor(c1 / 13) == Math.floor(c2 / 13));
	return (same_col || same_row) && (same_suit || adj_rank);
}

function are_adj_rank(c1, c2) {
	var r1 = c1 % 13;
	var r2 = c2 % 13;
	if (r1 == r2) {
		return true;
	}
	if ((r1 == 0 && r2 == 12) || (r1 == 12 && r2 == 0)) {
		return false;
	}
	if (Math.abs(r1 - r2) == 1) {
		return true;
	}
	return false;
}

function get_card_num(x, y) {
	for (var r = 0; r < 4; r++) {
		for (var c = 0; c < 4; c++) {
			var x_l = CARD_GRID_MARGIN_X + (CARD_WIDTH + 2 * CARD_MARGIN_X) * c;
			var y_l = CARD_GRID_MARGIN_Y + (CARD_HEIGHT + 2 * CARD_MARGIN_Y) * r;
			if ((x >= x_l && x <= x_l + CARD_WIDTH) && (y >= y_l && y <= y_l + CARD_HEIGHT)) {
				return r * 4 + c;
			}
		}
	}
	return -1;
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

function get_card_string(card_ID) {
	var rank = "A23456789TJQK"[card_ID % 13];
	var suit = "SHCD"[Math.floor(card_ID / 13)];
	return rank + suit;
}

function draw_card(ctx, x, y, card_ID) {
	ctx.fillStyle = "white";
	roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 7, true, false);
	ctx.font = "35pt Arial";
	ctx.fillStyle = (Math.floor(card_ID / 13)  == 1|| Math.floor(card_ID / 13) == 3) ? "red" : "black";
	ctx.fillText(get_card_string(card_ID), x + 17, y + 90);
}




//                         _                    _
//   ___    ___    _ __   | |_   _ __    ___   | |
//  / __|  / _ \  | '_ \  | __| | '__|  / _ \  | |
// | (__  | (_) | | | | | | |_  | |    | (_) | | |
//  \___|  \___/  |_| |_|  \__| |_|     \___/  |_|



function reset_game() {
	// reset history
	history_moves = [];

	// get deal
	card_grid = [];
	while (card_grid.length < 16) {
		var card_ID = Math.floor(Math.random() * 52);
		if (!card_grid.includes(card_ID)) {
			card_grid.push(card_ID);
		}
	}

	// reset shown solution
	document.getElementById('solution').innerHTML = "&emsp;";
}



function update() {
	ctx.clearRect(0, 0, WIDTH, HEIGHT);

	// dealt cards
	for (var i = 0; i < 16; i++) {
		var x = CARD_LOCATIONS_X[i % 4];
		var y = CARD_LOCATIONS_Y[Math.floor(i / 4)];
		if (card_grid[i] != -1) {
			draw_card(ctx, x, y, card_grid[i]);
		}
	}

	// hover card
	if (clicking) {
		var x = hover_xy[0] - hover_card_offset_xy[0];
		var y = hover_xy[1] - hover_card_offset_xy[1];
		draw_card(ctx, x, y, hover_card_ID);
	}

}
setInterval(function() {update()}, 5);



//  ____            _           _     _
// / ___|    ___   | |  _   _  | |_  (_)   ___    _ __
// \___ \   / _ \  | | | | | | | __| | |  / _ \  | '_ \
//  ___) | | (_) | | | | |_| | | |_  | | | (_) | | | | |
// |____/   \___/  |_|  \__,_|  \__| |_|  \___/  |_| |_|


function clone(array) {
	return JSON.parse(JSON.stringify(array));
}

function count_obj(arr, obj) {
	count = 0;
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == obj) {
			count++;
		}
	}
	return count;
}

function expand(array) {
	children = [];
	for (var from = 0; from < 16; from++) {
		for (var j = 0; j < MOVES[from].length; j++) {
			var to = MOVES[from][j];
			if (is_legal_move(array[from], from, array[to], to)) {
				var child = clone(array);
				child[to] = child[from];
				child[from] = -1;
				children.push([child, [from, to]]);
			}
		}
	}
	return children;
}

function get_solution(arr) {
	var stack = [[arr, [], count_obj(arr, -1)]];
	while (stack.length > 0) {
		var top = stack.pop();
		var parent = top[0];
		var soln = top[1];
		var depth = top[2];
		if (depth == 15) {
			return soln;
		} else {
			var children = expand(parent);
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var a = child[0];
				var m = child[1];
				var soln_copy = clone(soln);
				soln_copy.push(m);
				stack.push([a, soln_copy, depth + 1]);
			}
		}
	}
return -1
}

function show_solution() {
	var s = "";
	var solution = get_solution(card_grid);
	if (solution == -1) {
		document.getElementById('solution').innerHTML = "No solution.";
	} else {
		var cg = clone(card_grid);
		for (var i = 0; i < solution.length; i++) {
			var from = solution[i][0];
			var to = solution[i][1];
			s += get_card_string(cg[from]) + " > " + get_card_string(cg[to]);
			cg[to] = cg[from];
			cg[from] = -1;
			if (i < solution.length - 1) {
				s += "<br>";
			}
		}
		document.getElementById('solution').innerHTML = s;
	}

}
