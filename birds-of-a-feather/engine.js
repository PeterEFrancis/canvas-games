
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



//                               _                     _
//   ___    ___    _ __    ___  | |_    __ _   _ __   | |_   ___
//  / __|  / _ \  | '_ \  / __| | __|  / _` | | '_ \  | __| / __|
// | (__  | (_) | | | | | \__ \ | |_  | (_| | | | | | | |_  \__ \
//  \___|  \___/  |_| |_| |___/  \__|  \__,_| |_| |_|  \__| |___/


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





//                      _
//  _ __ __ _ _ __   __| | ___  _ __ ___
// | '__/ _` | '_ \ / _` |/ _ \| '_ ` _ \
// | | | (_| | | | | (_| | (_) | | | | | |
// |_|  \__,_|_| |_|\__,_|\___/|_| |_| |_|

// https://github.com/bryc/code/blob/master/jshash/PRNGs.md

var d = new Date();
var random = mulberry32(d.getTime());

function set_seed(seed) {
	random = mulberry32(seed);
}

function mulberry32(a) {
	return function() {
		a |= 0; a = a + 0x6D2B79F5 | 0;
		var t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}





//   __   _          _       _
//  / _| (_)   ___  | |   __| |  ___
// | |_  | |  / _ \ | |  / _` | / __|
// |  _| | | |  __/ | | | (_| | \__ \
// |_|   |_|  \___| |_|  \__,_| |___/


var clicked_card_num;
var clicked_card_ID;
var hover_xy;
var hover_card_offset_xy;
var hover_card_ID;
var card_grid;
var undo_history_moves; // ... [from_num, to_num, hidden_card_ID] ...
var redo_history_moves;
var show_flockability_graph;





//                                                _
//  _ __     __ _    __ _    ___     ___    ___  | |_   _   _   _ __
// | '_ \   / _` |  / _` |  / _ \   / __|  / _ \ | __| | | | | | '_ \
// | |_) | | (_| | | (_| | |  __/   \__ \ |  __/ | |_  | |_| | | |_) |
// | .__/   \__,_|  \__, |  \___|   |___/  \___|  \__|  \__,_| | .__/
// |_|              |___/                                      |_|


reset_game();

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener('mousedown', function(evt) {
  var rect = canvas.getBoundingClientRect();
  var x = evt.clientX - rect.left;
  var y = evt.clientY - rect.top;
	var cn = get_card_num(x, y);
	if (cn != -1) {
		if (card_grid[cn] != -1) {
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

document.addEventListener('mouseup', function(evt) {
	var rect = canvas.getBoundingClientRect();
	var x = evt.clientX - rect.left;
	var y = evt.clientY - rect.top;
	var cn = get_card_num(x, y);
	if (hover_card_ID != -1) {
		if (is_legal_move(clicked_card_ID, clicked_card_num, card_grid[cn], cn)) {
			// add to history
			undo_history_moves.push([clicked_card_num, cn, card_grid[cn]]);
			// move card
			card_grid[cn] = hover_card_ID;
		} else {
			// put it back
			card_grid[clicked_card_num] = hover_card_ID;
		}
		hover_card_ID = -1;
	}
});

document.addEventListener('keydown', function(event) {
  if (event.keyCode == 90 && (event.metaKey || event.ctrlKey)) {
		if (hover_card_ID == -1) {
			undo();
		}
	}
});

document.addEventListener('keydown', function(event) {
  if (event.keyCode == 89 && (event.metaKey || event.ctrlKey)) {
		if (hover_card_ID == -1) {
			redo();
		}
	}
});

document.addEventListener('keydown', function(event) {
  if (event.keyCode == 84) {
		toggle_flockability_graph();
	}
});

document.addEventListener('keydown', function(event) {
  if (event.keyCode == 82) {
		reset_game();
	}
});

show_flockability_graph = false;

hover_card_ID = -1;




//                         _                    _
//   ___    ___    _ __   | |_   _ __    ___   | |
//  / __|  / _ \  | '_ \  | __| | '__|  / _ \  | |
// | (__  | (_) | | | | | | |_  | |    | (_) | | |
//  \___|  \___/  |_| |_|  \__| |_|     \___/  |_|



function reset_game() {
	// reset history
	undo_history_moves = [];
	redo_history_moves = [];

	// get deal
	card_deal = get_random_grid();
	// card_grid = get_solvable_grid();

	// reset shown solution
	document.getElementById('solution').innerHTML = "&emsp;";

	// reset hover
	hover_card_ID = -1;
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
	if (hover_card_ID != -1) {
		var x = hover_xy[0] - hover_card_offset_xy[0];
		var y = hover_xy[1] - hover_card_offset_xy[1];
		draw_card(ctx, x, y, hover_card_ID);
	}


	// flockability
	if (show_flockability_graph) {
		for (var i = 0; i < 16; i++) {
			if (card_grid[i] != -1) {
				var x1 = CARD_LOCATIONS_X[i % 4] + CARD_WIDTH/2;
				var y1 = CARD_LOCATIONS_Y[Math.floor(i/4)] + CARD_HEIGHT/2;
				ctx.fillStyle = "blue";
				ctx.beginPath();
				ctx.arc(x1, y1, 10, 0, 2 * Math.PI);
				ctx.fill();
				for (var j = i + 1; j < 16; j++) {
					if (card_grid[j] != -1) {
						if (is_flockable(card_grid[i], card_grid[j])) {
							var x2 = CARD_LOCATIONS_X[j % 4] + CARD_WIDTH/2;
							var y2 = CARD_LOCATIONS_Y[Math.floor(j/4)] + CARD_HEIGHT/2;
							ctx.strokeStyle = "blue";
							curved_line(x1, y1, x2, y2);
						}
					}
				}
			}
		}
		// hover card
		if (hover_card_ID != -1) {
			var x1 = hover_xy[0] - hover_card_offset_xy[0] + CARD_WIDTH/2;
			var y1 = hover_xy[1] - hover_card_offset_xy[1] + CARD_HEIGHT/2;
			ctx.fillStyle = "blue";
			ctx.beginPath();
			ctx.arc(x1, y1, 10, 0, 2 * Math.PI);
			ctx.fill();
			for (var k = 0; k < 16; k++) {
				if (card_grid[k] != -1 && is_flockable(hover_card_ID, card_grid[k])) {
					var x2 = CARD_LOCATIONS_X[k % 4] + CARD_WIDTH/2;
					var y2 = CARD_LOCATIONS_Y[Math.floor(k/4)] + CARD_HEIGHT/2;
					ctx.strokeStyle = "blue";
					curved_line(x1, y1, x2, y2);
				}
			}
		}
	}

}
setInterval(function() {update()}, 5);

function undo() {
	if (undo_history_moves.length > 0) {
		var last = undo_history_moves.pop();
		redo_history_moves.push(last);
		var from_num = last[0];
		var to_num = last[1];
		var hidden_card_ID = last[2];
		card_grid[from_num] = card_grid[to_num];
		card_grid[to_num] = hidden_card_ID;
	}
}

function redo() {
	console.log("redo");
	if (redo_history_moves.length > 0) {
		var last = redo_history_moves.pop();
		undo_history_moves.push(last);
		var from_num = last[0];
		var to_num = last[1];
		var hidden_card_ID = last[2];
		card_grid[to_num] = card_grid[from_num];
		card_grid[from_num] = -1;
	}
}

function toggle_flockability_graph() {
	show_flockability_graph = [true, false][0 + show_flockability_graph];
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
			s += get_card_string(cg[from]) + "→" + get_card_string(cg[to]);
			cg[to] = cg[from];
			cg[from] = -1;
			if (i < solution.length - 1) {
				s += ", ";
			}
		}
		document.getElementById('solution').innerHTML = s;
		console.log(s);
	}

}




//      _
//   __| |  _ __    __ _  __      __
//  / _` | | '__|  / _` | \ \ /\ / /
// | (_| | | |    | (_| |  \ V  V /
//  \__,_| |_|     \__,_|   \_/\_/


function draw_card(ctx, x, y, card_ID) {
	ctx.fillStyle = "white";
	roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 7, true, false);
	ctx.font = "100pt monospace";
	ctx.fillStyle = ["black", "rgb(255, 42, 92)", "rgb(155, 247, 122)", "rgb(101, 164, 230)"][Math.floor(card_ID / 13)];
	ctx.fillText(get_card_string(card_ID)[1], x + 10, y + 145);
	ctx.font = "35pt monospace";
	ctx.fillText(get_card_string(card_ID)[0], x + 5, y + 40);
}

function curved_line(x1, y1, x2, y2) {
	var curveScale = 0.1;
	var xCenter = WIDTH / 2;
	var yCenter = HEIGHT / 2;
	var xMid = (x1 + x2) / 2;
	var yMid = (y1 + y2) / 2;
	var dx = x1 - x2;
	var dy = y1 - y2;
	var x3 = xMid - curveScale * dy;
	var y3 = yMid + curveScale * dx;
	var x4 = xMid + curveScale * dy;
	var y4 = yMid - curveScale * dx;
	var distSqr3 = (x3 - xCenter) *  (x3 - xCenter) + (y3 - yCenter) * (y3 - yCenter);
	var distSqr4 = (x4 - xCenter) *  (x4 - xCenter) + (y4 - yCenter) * (y4 - yCenter);
	if (distSqr4 > distSqr3) {
		x3 = x4;
		y3 = y4;
	}
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.quadraticCurveTo(x3, y3, x2, y2);
	ctx.stroke();
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







//  _              _
// | |__     ___  | |  _ __     ___   _ __   ___
// | '_ \   / _ \ | | | '_ \   / _ \ | '__| / __|
// | | | | |  __/ | | | |_) | |  __/ | |    \__ \
// |_| |_|  \___| |_| | .__/   \___| |_|    |___/
//                    |_|


function is_flockable(c1, c2) {
	var adj_rank = are_adj_rank(c1, c2);
	var same_suit = (Math.floor(c1 / 13) == Math.floor(c2 / 13));
	return same_suit || adj_rank;
}

function is_mobile(cn1, cn2) {
	var same_row = Math.floor(cn1 / 4) == Math.floor(cn2 / 4);
	var same_col = cn1 % 4 == cn2 % 4;
	return same_col || same_row;
}

function is_legal_move(c1, cn1, c2, cn2) {
	if (c1 == -1 || c2 == -1) {
		return false;
	}
	return is_mobile(cn1, cn2) && is_flockable(c1, c2);
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

function get_card_string(card_ID) {
	var rank = "A23456789TJQK"[card_ID % 13];
	var suit = "♠♥♣♦"[Math.floor(card_ID / 13)];
	return rank + suit;
}

function get_random_grid() {
	card_grid = [];
	while (card_grid.length < 16) {
		var card_ID = Math.floor(random() * 52);
		if (!card_grid.includes(card_ID)) {
			card_grid.push(card_ID);
		}
	}
	return card_grid;
}






//        _             _
//  ___  | |_    __ _  | |_    ___
// / __| | __|  / _` | | __|  / _ \
// \__ \ | |_  | (_| | | |_  |  __/
// |___/  \__|  \__,_|  \__|  \___|
//   __                  _
//  / _|   ___    __ _  | |_   _   _   _ __    ___   ___
// | |_   / _ \  / _` | | __| | | | | | '__|  / _ \ / __|
// |  _| |  __/ | (_| | | |_  | |_| | | |    |  __/ \__ \
// |_|    \___|  \__,_|  \__|  \__,_| |_|     \___| |___/


function flockability_of(cg) {
	var count = 0;
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			for (var j = i + 1; j < 16; j++) {
				if (cg[j] != -1) {
					count += is_flockable(cg[i], cg[j]);
				}
			}
		}
	}
	return count;
}

function mobility_of(cg) {
	var count = 0;
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			for (var j = i + 1; j < 16; j++) {
				if (cg[j] != -1) {
					count += (is_flockable(cg[i], cg[j]) && is_mobile(i,j));
				}
			}
		}
	}
	return count;
}

function has_odd_bird(cg) {
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			var has_pair = false;
			for (var j = 0; j < 16; j++) {
				if (j != i && cg[j] != -1) {
					if (is_flockable(cg[i], cg[j])) {
						has_pair = true;
						break;
					}
				}
			}
			if (!has_pair) {
				return true;
			}
		}
	}
	return false;
}

function min_degree_of(cg) {
	var min = 15;
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			var deg = 0;
			for (var j = 0; j < 16; j++) {
				if (i != j && cg[j] != -1) {
					deg += is_flockable(cg[i], cg[j]);
				}
			}
			if (deg < min) {
				min = deg;
			}
		}
	}
	return min;
}

function mobility_flockability_ratio_of(cg) {
	var mob_count = 0;
	var flock_count = 0;
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			for (var j = i + 1; j < 16; j++) {
				if (cg[j] != -1) {
					var flock = is_flockable(cg[i], cg[j]);
					var mob = is_mobile(i,j);
					flock_count += flock;
					mob_count += mob && flock;
				}
			}
		}
	}
	return mob_count / flock_count;
}

function rank_cluster_count_of(cg) {
	var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			counts[cg[i] % 13] += 1;
		}
	}
	var rank = 0;
	var past_zero = counts[0] == 0;
	var cluster_count = past_zero ? 0 : 1;
	for (rank = 1; rank < 13; rank++) {
		if (counts[rank] ==! 0) {
			if (past_zero) {
				cluster_count += 1;
			}
		}
		past_zero = (counts[rank] == 0);
	}
	return cluster_count;
}

function rank_deviation(cg) {
	var avg = 0;
	for (var i = 0; i < 16; i++) {
		if (cg[i] == -1) {
			avg += cg[i] % 13;
		}
	}
	avg /= 16;
	var stdv = 0;
	for (var i = 0; i < 16; i++) {
		if (cg[i] == -1) {
			stdv += Math.pow((avg - (cg[i] % 13)), 2);
		}
	}
	stdv /= 15;
	stdv = Math.sqrt(stdv);
	return stdv;
}

function suit_dominance_of(cg) {
	var suit_count = [0,0,0,0];
	var card_count = 0;
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			card_count += 1;
			var suit = Math.floor(cg[i] / 13);
			suit_count[suit] += 1;
		}
	}
	return (Math.max(...suit_count)/card_count) - (Math.min(...suit_count)/card_count);
}

function diameter_of(cg) {
	var t =[];
	for (var i = 0; i < 16; i++) {
		if (cg[i] != -1) {
			t.push(i);
		}
	}
	var n = t.length;
	var graph = [];
	for (var i = 0; i < n; i++) {
		var row = [];
		for (var j = 0; j < n; j++) {
			if (i == j) {
				row.push(0);
			} else if (is_flockable(cg[t[i]], cg[t[j]])) {
				row.push(1)
			} else {
				row.push(Infinity);
			}
		}
		graph.push(row);
	}

	for (var k = 0; k < n; k++) {
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				graph[i][j] = Math.min(graph[i][j], graph[i][k] + graph[k][j]);
			}
		}
	}
	max = 0;
	for (var i = 0; i < n; i++) {
		var row_max = Math.max(...graph[i]);
		if (row_max > max) {
			max = row_max;
		}
	}
	return max;
}








//  ____            _           _     _
// / ___|    ___   | |  _   _  | |_  (_)   ___    _ __
// \___ \   / _ \  | | | | | | | __| | |  / _ \  | '_ \
//  ___) | | (_) | | | | |_| | | |_  | | | (_) | | | | |
// |____/   \___/  |_|  \__,_|  \__| |_|  \___/  |_| |_|

function get_solvable_grid() {
	var grid = [];
	for (var i = 0; i < 16; i++) {
		grid.push(-1);
	}
	var j = Math.floor(random() * 16);
	grid[j] = Math.floor(random() * 52);
	for (var i = 0; i < 15; i++) {
		var curr_card_num;
		var move = -1;
		var new_card_ID;
		do {
			curr_card_num = Math.floor(random() * 16);
			if (grid[curr_card_num] != -1) {
				for (var k = 0; k < 6; k++) {
					move = MOVES[curr_card_num][k];
					if (grid[move] == -1) {
						break;
					}
				}
			}
		} while (grid[curr_card_num] == -1 || move == -1 || grid[move] != -1);
		do {
			new_card_ID = Math.floor(random() * 52);
		} while (grid.includes(new_card_ID) || !is_legal_move(grid[curr_card_num], curr_card_num, new_card_ID, move));
		grid[move] = new_card_ID;
	}
	return grid;
}

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
	return basic_depth_first_search(arr);
}

function basic_depth_first_search(arr) {
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
