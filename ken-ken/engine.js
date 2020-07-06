
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const NONE = 0;

const LINE_WIDTH_THIN = 2;
const LINE_WIDTH_THICK = 10;
const DIRS = [[0, 1], [0, -1], [1, 0], [-1,0]];



var num_squares;
var square_size;
var groups;


var board;
var solution;
var cages;
var board_cage_outline;
var selected_square_id;



function set_meta(num_sq) {
	num_squares = num_sq;
	square_size = canvas.width / num_squares;

	groups = [];
	let h_group, v_group, s_group;
	for (var i = 0; i < num_squares; i++) {
		h_group = [];
		v_group = [];
		for (var j = 0; j < num_squares; j++) {
			h_group.push(i * num_squares + j);
			v_group.push(j * num_squares + i);
		}
		groups.push(h_group, v_group);
	}

	for (var i = 4; i <= 9; i++) {
		document.getElementById("" + i).disabled = i > num_squares;
	}

}

function change_num_squares(amount) {
	if (num_squares + amount > 2 && num_squares + amount < 10) {
		set_meta(num_squares + amount);
		new_game();
	}
}



set_meta(4);

new_game();




function get_children(parent) {
	var child;
	var children = [];
	for (var j = 1; j < num_squares + 1; j++) {
		if (can_place(j, parent.grid, parent.depth)) {
			child = {grid: [...parent.grid], depth: parent.depth + 1};
			child.grid[parent.depth] = j;
			children.push(child);
		}
	}
	return children;
}

function get_number_grid() {
	var root = {grid:[], depth:0};
	for (var i = 0; i < num_squares * num_squares; i++) {
		root.grid.push(0);
	}
	var stack = [root];
	found = 0;
	while (stack.length > 0) {
		parent = stack.pop();
		if (parent.depth == num_squares * num_squares) {
			return parent.grid;
		}
		stack.push(...shuffle(get_children(parent)));
	}
	return temp;
}

function get_swaps() {
	swaps = [];
	for (var i = 0; i < num_squares; i++) {
		for (var j = i + 1; j < num_squares; j++) {
			swaps.push([i,j]);
		}
	}
	return swaps;
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




function is_solved(b, c) {
	for (var i = 0; i < groups.length; i++) {
		var s = [];
		for (var j = 0; j < num_squares; j++) {
			if (b[groups[i][j]] == NONE) {
				return false;
			}
			s.push(b[groups[i][j]]);
		}
		if ((new Set(s)).size != num_squares) {
			return false;
		}
	}

	for (var i = 0; i < c.length; i++) {
		if (!check_cage(b, c[i])) {
			return false;
		}
	}

	return true;
}

function check_cage(b, cage) {
	if (cage.op == "") {
		return (b[cage.locs[0]] == Number(cage.comb));
	}

	var els = [];
	for (var i = 0; i < cage.locs.length; i++) {
		els.push(b[cage.locs[i]]);
	}
	var larger = Math.max(...els);
	var smaller = Math.min(...els);

	if (cage.op == "-") {
		return larger - smaller == cage.comb;
	} else if (cage.op == "÷") {
		return larger / smaller == cage.comb;
	} else if (cage.op == "+") {
		var s = 0;
		for (var i = 0; i < els.length; i++) {
			s += els[i];
		}
		return s == cage.comb;
	} else {
		var p = 1;
		for (var i = 0; i < els.length; i++) {
			p *= els[i];
		}
		return p == cage.comb;
	}
}

function get_cages_and_outline(b) {
	c = [];
	bco = [];
	var remaining = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		remaining.push(i);
	}
	while (remaining.length > 0) {
		// make a cage
		var cage = {locs: [], op: "", comb: 0};
		// find a random first element, and move it from `remaining` to cage.locs
		var first = remaining[Math.floor(Math.random() * remaining.length)];
		cage.locs.push(first);
		bco[first] = c.length;
		remaining.splice(remaining.indexOf(first), 1);
		// add adjacent cells to cage.locs
		var next, last;
		var dirs = shuffle([...DIRS]);
		while (remaining.length > 0 && cage.locs.length < Math.max(2, Math.floor(num_squares/2))) {
			var extended = false;
			last = cage.locs[cage.locs.length - 1];
			var col =  last % num_squares;
			var row = Math.floor(last / num_squares);
			var dir, next;
			for (var i = 0; i < 4; i++) {
				dir = dirs[i];
				if (col + dir[1] < num_squares && col + dir[1] >= 0) {
					if (row + dir[0] < num_squares && row + dir[0] >= 0) {
						next = col + dir[1] + num_squares * (row + dir[0]);
						if (remaining.includes(next)) {
							remaining.splice(remaining.indexOf(next), 1);
							cage.locs.push(next);
							bco[next] = c.length;
							extended = true;
							break;
						}
					}
				}
			}
			if (!extended) {
				break;
			}
		}
		var els = [];
		for (var i = 0; i < cage.locs.length; i++) {
			els.push(b[cage.locs[i]]);
		}
		if (els.length == 1) {
			cage.op = "";
			cage.comb = els[0];
		} else if (els.length == 2 && Math.random() < 0.5) {
			var larger = Math.max(...els);
			var smaller = Math.min(...els);
			if (larger % smaller == 0) {
				cage.op = "÷";
				cage.comb = larger / smaller;
			} else {
				cage.op = "-";
				cage.comb = larger - smaller;
			}
		} else {
			if (Math.random() < 0.5) {
				cage.op = "+";
				var s = 0;
				for (var i = 0; i < els.length; i++) {
					s += els[i];
				}
				cage.comb = s;
			} else {
				cage.op = "×";
				var p = 1;
				for (var i = 0; i < els.length; i++) {
					p *= els[i];
				}
				cage.comb = p;
			}
		}
		// console.log(cage);
		c.push(cage);
	}
	return [c, bco];
}

function quick_test_has_multiple_solutions(b, c) {

	var temp, new_b_r, new_b_c;
	var swaps = get_swaps();
	for (var s = 0; s < swaps.length; s++) {
		// swap two rows
		new_b_r = [...b];
		for (var i = 0; i < num_squares; i++) {
			new_b_r[swaps[s][0] * num_squares + i] = b[swaps[s][1] * num_squares + i];
			new_b_r[swaps[s][1] * num_squares + i] = b[swaps[s][0] * num_squares + i];
		}
		if (is_solved(new_b_r, c)) {
			return true;
		}

		// swap two columns
		new_b_c = [...b];
		for (var i = 0; i < num_squares; i++) {
			new_b_c[i * num_squares + swaps[s][0]] = b[i * num_squares + swaps[s][1]];
			new_b_c[i * num_squares + swaps[s][1]] = b[i * num_squares + swaps[s][0]];
		}
		if (is_solved(new_b_c, c)) {
			return true;
		}
	}

	return false;
}




function new_game() {

	board = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		board.push(0);
	}

	do {
		solution = get_number_grid();
		cages_and_outline = get_cages_and_outline(solution);
		cages = cages_and_outline[0];
		board_cage_outline = cages_and_outline[1];
	} while(quick_test_has_multiple_solutions(solution, cages));

	selected_square_id = -1;

	document.getElementById('message').innerHTML = "";

	update_display();
}


function place(num) {
	if (selected_square_id != -1 && num <= num_squares) {
		board[selected_square_id] = num;
		update_display();
	}
}


function can_place(num, grid, loc) {
	// iterate through all of the groups that contain loc
	// if any one of the groups contains a location loc2 for which grid[loc2] == num, return false
	// otherwise, return true
	for (var i = 0; i < groups.length; i++) {
		if (groups[i].includes(loc)) {
			for (var j = 0; j < num_squares; j++) {
				if (grid[groups[i][j]] == num) {
					return false;
				}
			}
		}
	}
	return true;
}


function show_solution() {
	board = [...solution];
	update_display();
}


function check() {
	if (is_solved(board, cages)) {
		document.getElementById('message').innerHTML = "Complete!";
		document.getElementById('message').style.color = "green";
	} else if (board.includes(NONE)) {
		document.getElementById('message').innerHTML = "You're not done yet!";
		document.getElementById('message').style.color = "yellow";
	} else {
		document.getElementById('message').innerHTML = "Something is wrong!";
		document.getElementById('message').style.color = "red";
	}
}





function update_display() {
	// clear the display
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// cage colors
	// for (var i = 0; i < cages.length; i++) {
	// 	ctx.fillStyle = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + "," + 0.4 + ")";
	// 	for (var j = 0; j < cages[i].locs.length; j++) {
	// 		var x = (cages[i].locs[j] % num_squares) * square_size;
	// 		var y = Math.floor(cages[i].locs[j] / num_squares) * square_size;
	// 		ctx.fillRect(x, y, square_size, square_size);
	// 	}
	// }

	// cage labels
	ctx.fillStyle = "black";
	var cage;
	for (var i = 0; i < cages.length; i++) {
		cage = cages[i];
		var top = Math.min(...cage.locs);
		var x = (top % num_squares) * square_size;
		var y = Math.floor(top / num_squares) * square_size;
		ctx.font = (square_size * 0.2) + "px monospace";
		ctx.fillText(cage.comb + cage.op, x + square_size * 0.1, y + square_size * 0.25);
	}


	// cage outlines
	ctx.fillStyle = "black";
	ctx.fillRect(0 - LINE_WIDTH_THICK / 2, 0 - LINE_WIDTH_THICK / 2, canvas.width, LINE_WIDTH_THICK);
	ctx.fillRect(0 - (LINE_WIDTH_THICK / 2), 0, LINE_WIDTH_THICK, canvas.width);
	ctx.fillRect(0 - LINE_WIDTH_THICK / 2, num_squares * square_size - LINE_WIDTH_THICK / 2, canvas.width, LINE_WIDTH_THICK);
	ctx.fillRect(num_squares * square_size - (LINE_WIDTH_THICK / 2), 0, LINE_WIDTH_THICK, canvas.width);

	for (var i = 0; i < num_squares * num_squares; i++) {
		if (board_cage_outline[i] != board_cage_outline[i + 1]) {
			ctx.fillRect((i % num_squares + 1) * square_size - (LINE_WIDTH_THICK / 2),
			             Math.floor(i / num_squares) * square_size - LINE_WIDTH_THICK / 2,
			             LINE_WIDTH_THICK, square_size + LINE_WIDTH_THICK);
		}
		if (i + num_squares < num_squares * num_squares && board_cage_outline[i] != board_cage_outline[i + num_squares]) {
			ctx.fillRect((i % num_squares) * square_size - (LINE_WIDTH_THICK / 2),
			             (Math.floor(i / num_squares)  + 1) * square_size - (LINE_WIDTH_THICK / 2),
			             square_size + LINE_WIDTH_THICK, LINE_WIDTH_THICK);
		}
	}



	// add numbers
	for (var i = 0; i < num_squares * num_squares; i++) {
		if (board[i] != 0) {
			var x = (i % num_squares) * square_size;
			var y = Math.floor(i / num_squares) * square_size;
			ctx.fillStyle = "black";
			ctx.font = (square_size * 0.6) + "px monospace";
			ctx.fillText(board[i], x + square_size * 0.3, y + square_size * 0.8);
		}
	}

	// add the grid lines
	ctx.fillStyle = "black";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH_THIN / 2, i * square_size - LINE_WIDTH_THIN / 2, canvas.width, LINE_WIDTH_THIN);
		ctx.fillRect(i * square_size - (LINE_WIDTH_THIN / 2), 0, LINE_WIDTH_THIN, canvas.width);
	}

	// add selected square shadow
	ctx.strokeStyle = "blue";
	if (selected_square_id != -1) {
		var x = (selected_square_id % num_squares) * square_size;
		var y = Math.floor(selected_square_id / num_squares) * square_size;
		ctx.shadowBlur = 8;
		ctx.shadowColor = "blue";
		ctx.lineWidth = 5;
		ctx.strokeRect(x, y, square_size, square_size);
	}
	ctx.shadowBlur = 0;


}


canvas.addEventListener('click', function() {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	var row = Math.floor(user_y / (canvas.width / num_squares));
	var col = Math.floor(user_x / (canvas.width / num_squares));
	if (selected_square_id == row * num_squares + col) {
		selected_square_id = -1;
	} else {
		selected_square_id = row * num_squares + col;
	}
	update_display();
});















// function get_num_solutions(b) {
// 	var num_solutions = 0;
// 	var root = {grid:[], depth:0};
// 	for (var i = 0; i < num_squares * num_squares; i++) {
// 		root.grid.push(0);
// 	}
// 	var queue = [root];
// 	while (queue.length > 0) {
// 		var parent = queue.shift();
// 		if (parent.depth == num_squares * num_squares) {
// 			return num_solutions;
// 		}
// 		stack.push(...shuffle(get_children(parent)));
// 	}
// }



// // UNIQUE (STRICT):
// function get_number_grid() {
// 	var temp = [];
// 	var root = {grid:[], depth:0};
// 	for (var i = 0; i < num_squares * num_squares; i++) {
// 		root.grid.push(0);
// 	}
// 	var stack = [root];
// 	var found, parent;
// 	do {
// 		found = 0;
// 		while (stack.length > 0) {
// 			parent = stack.pop();
// 			if (parent.depth == num_squares * num_squares) {
// 				temp = parent.grid;
// 				found += 1;
// 				if (found == 2) {
// 					break;
// 				}
// 			}
// 			stack.push(...shuffle(get_children(parent)));
// 		}
// 	} while (found != 1);
// 	return temp;
// }
