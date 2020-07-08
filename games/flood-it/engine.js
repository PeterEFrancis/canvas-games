
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const NUM_SQUARES = 20;

const SQUARE_SIZE = canvas.width / NUM_SQUARES;

const COLOR_STRINGS = ["red", "orange", "yellow", "green", "blue", "purple"];

const RED = 0;
const ORANGE = 1;
const YELLOW = 2;
const GREEN = 3;
const BLUE = 4;
const PURPLE = 5;

const COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE];


var grid  = [];
var floods = 0;
var best = Infinity;
var possible;

new_game();



function user_flood(color) {
	if (!is_all_flooded(grid)) {
		grid = fill(grid, get_flooded(grid).flooded, color);
		floods += 1;
		update();
		if (is_all_flooded(grid)) {
			if (floods < best) {
				best = floods;
				update();
			}
			ctx.fillStyle = ["white", "black", "black", "white", "white", "white"][grid[0]];
			ctx.textAlign = "center";
			ctx.font = "80px Arial";
			ctx.fillText("You Flooded the Board", canvas.width / 2, canvas.height / 2 - 50);
			ctx.fillText("in " + floods + " flood" + (floods == 1 ? "" : "s") + "!", canvas.width / 2, canvas.height / 2 + 50);
		}
	}
}



function get_flooded(g) {
		var already_checked = [];
		var same_color = [];
		var boundary_colors = [];
		var boundary_color_counts = [0, 0, 0, 0, 0, 0];
		var stack = [0];
		while (stack.length > 0) {
			var p = stack.pop();
			if (!already_checked.includes(p)) {
				already_checked.push(p);
				same_color.push(p);
				var counted = false;
				// down row
				if (Math.floor(p / NUM_SQUARES) + 1 < NUM_SQUARES) {
					if (g[p + NUM_SQUARES] == g[0]) {
						stack.push(p + NUM_SQUARES);
					} else {
						boundary_colors.push(g[p + NUM_SQUARES]);
						boundary_color_counts[g[p + NUM_SQUARES]] += 1;
						counted = true;
					}
				}
				// right col
				if ((p % NUM_SQUARES) < NUM_SQUARES - 1) {
					if (g[p + 1] == g[0]) {
						stack.push(p + 1);
					} else {
						boundary_colors.push(g[p + 1]);
						if (!counted) {
							boundary_color_counts[g[p + 1]] += 1;
						}
					}
				}
				// up row
				if (Math.floor(p / NUM_SQUARES) - 1 >= 0) {
					if (g[p - NUM_SQUARES] == g[0]) {
						stack.push(p - NUM_SQUARES);
					} else {
						boundary_colors.push(g[p - NUM_SQUARES]);
						if (!counted) {
							boundary_color_counts[g[p - NUM_SQUARES]] += 1;
						}
					}
				}
				// left col
				if ((p % NUM_SQUARES) - 1 >= 0) {
					if (g[p - 1] == g[0]) {
						stack.push(p - 1);
					} else {
						boundary_colors.push(g[p - 1]);
						if (!counted) {
							boundary_color_counts[g[p - 1]] += 1;
						}
					}
				}
			}
		}

		return {flooded: same_color, boundary_colors: [...(new Set(boundary_colors))], boundary_color_counts: boundary_color_counts};

}


function get_random_grid() {
	var g = [];
	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		g.push(Math.floor(Math.random() * (PURPLE + 1)));
	}
	return g;
}


function new_game() {
	// reset floods
	floods = 0;

	// set grid randomly
	grid = get_random_grid();

	// get possible
	possible = get_possible();

	// update display
	update();

}


function is_all_flooded(g) {
	var tl = g[0];
	for (var i = 0; i < NUM_SQUARES * NUM_SQUARES; i++) {
		if (g[i] != tl) {
			return false;
		}
	}
	return true;
}


function get_solution() {
	var root = {g: [...grid], solution: []};
	var queue = [root];
	var parent, child;

	while (queue.length > 0) {
		parent = queue.shift();

		var fp = get_flooded(parent.g);

		if (fp.flooded.length == NUM_SQUARES * NUM_SQUARES) {
			return parent.solution;
		}

		for (var c = 0; c < fp.boundary_colors.length; c++) {
			child  = {g: fill([...parent.g], fp.flooded, fp.boundary_colors[c]), solution: [...parent.solution, fp.boundary_colors[c]]};
			queue.push(child);
		}
	}

}


function fill(g, locs, color) {
	for (var i = 0; i < locs.length; i++) {
		g[locs[i]] = color;
	}
	return g;
}



function update() {

	// floods and best
	document.getElementById('floods').innerHTML = floods;
	document.getElementById('possible').innerHTML = possible;
	document.getElementById('best').innerHTML = best == Infinity ? "" : ("Personal Best: " + best);

	// draw blocks
	for (var i = 0; i < NUM_SQUARES; i++) {
		for (var j = 0; j < NUM_SQUARES; j++) {
			var x = i * SQUARE_SIZE;
			var y = j * SQUARE_SIZE;
			ctx.fillStyle = COLOR_STRINGS[grid[j * NUM_SQUARES + i]];
			ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
		}
	}

}








// testing function


function get_possible() {
	var g = [...grid]; // get_random_grid();
	var f = 0;
	while (!is_all_flooded(g)) {
		var boundary_color_counts = get_flooded(g).boundary_color_counts;
		var color = boundary_color_counts.indexOf(Math.max(...boundary_color_counts));
		g = fill(g, get_flooded(g).flooded, color);
		f += 1;
	}
	return f;
}























// function get_flooded(g) {
// 	if (g.length > 0) {
// 		var already_checked = [];
// 		var same_color = [];
// 		var stack = [0];
// 		while (stack.length > 0) {
// 			var p = stack.pop();
// 			if (!already_checked.includes(p)) {
// 				already_checked.push(p);
// 				same_color.push(p);
// 				// down row
// 				if (Math.floor(p / NUM_SQUARES) + 1 < NUM_SQUARES && g[p + NUM_SQUARES] == g[0]) {
// 					stack.push(p + NUM_SQUARES);
// 				}
// 				// right col
// 				if ((p % NUM_SQUARES) < NUM_SQUARES - 1 && g[p + 1] == g[0]) {
// 					stack.push(p + 1);
// 				}
// 				// up row
// 				if (Math.floor(p / NUM_SQUARES) - 1 >= 0 && g[p - NUM_SQUARES] == g[0]) {
// 					stack.push(p - NUM_SQUARES);
// 				}
// 				// left col
// 				if ((p % NUM_SQUARES) - 1 >= 0 && g[p - 1] == g[0]) {
// 					stack.push(p - 1);
// 				}
// 			}
// 		}
//
// 		return same_color;
// 	}
// }



// function flood(g, color) {
// 	var same_color = get_flooded(g).flooded;
// 	for (var i = 0; i < same_color.length; i++) {
// 		g[same_color[i]] = color;
// 	}
// 	return g;
// }




// function get_boundary_colors(g) {
// 	var boundary_colors = [];
// 	var flooded = get_flooded(g);
// 	for (var p = 0; p < flooded.length; p++) {
// 		// down row
// 		if (Math.floor(p / NUM_SQUARES) + 1 < NUM_SQUARES && g[p + NUM_SQUARES] != g[0]) {
// 			boundary_colors.push(g[p + NUM_SQUARES]);
// 		}
// 		// right col
// 		if ((p % NUM_SQUARES) < NUM_SQUARES - 1 && g[p + 1] != g[0]) {
// 			boundary_colors.push(g[p + 1]);
// 		}
// 		// up row
// 		if (Math.floor(p / NUM_SQUARES) - 1 >= 0 && g[p - NUM_SQUARES] != g[0]) {
// 			boundary_colors.push(g[p - NUM_SQUARES]);
// 		}
// 		// left col
// 		if ((p % NUM_SQUARES) - 1 >= 0 && g[p - 1] != g[0]) {
// 			boundary_colors.push(g[p - 1]);
// 		}
// 	}
//
// 	return [...(new Set(boundary_colors))];
// }
// function get_solution() {
// 	var root = {g: [...grid], solution: []};
// 	var queue = [root];
// 	var parent, child;
//
// 	while (queue.length > 0) {
// 		parent = queue.shift();
//
// 		// console.log(parent.g);
// 		if (is_all_flooded(parent.g)) {
// 			return parent.solution;
// 		}
// 		var bc = get_boundary_colors(parent.g);
// 		for (var c = 0; c < bc.length; c++) {
// 			child  = {g: flood([...parent.g], bc[c]), solution: [...parent.solution, bc[c]]};
// 			queue.push(child);
// 		}
// 	}
//
// }
