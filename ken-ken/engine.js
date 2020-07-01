
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



set_meta(4);

new_game();



function change_num_squares(amount) {
	if (num_squares + amount > 2 && num_squares + amount < 10) {
		set_meta(num_squares + amount);
		new_game();
	}
}


function new_game() {

	solution = get_number_grid();
	board = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		board.push(0);
	}
	get_cages();

	selected_square_id = -1;

	document.getElementById('message').innerHTML = "";

	update_display();
}


function place(num) {
	if (selected_square_id != -1) {
		board[selected_square_id] = num;
		update_display();
	}
}


function get_cages() {
	cages = [];
	board_cage_outline = [];
	var remaining = [];
	for (var i = 0; i < num_squares * num_squares; i++) {
		remaining.push(i);
	}
	while (remaining.length > 0) {
		// make a cage
		var cage = {locs: [], label: ""};
		// find a random first element, and move it from `remaining` to cage.locs
		var first = remaining[Math.floor(Math.random() * remaining.length)];
		cage.locs.push(first);
		board_cage_outline[first] = cages.length;
		remaining.splice(remaining.indexOf(first), 1);
		// add adjacent cells to cage.locs
		var next, last;
		var dirs = shuffle([...DIRS]);
		while ((remaining.length > 0 && cage.locs.length < Math.floor(Math.sqrt(num_squares) + Math.random()))) {
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
							board_cage_outline[next] = cages.length;
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
			els.push(solution[cage.locs[i]]);
		}
		if (els.length == 1) {
			cage.label = "" + els[0];
		} else if (els.length == 2 && Math.random() < 0.5) {
			var larger = Math.max(...els);
			var smaller = Math.min(...els);
			if (larger % smaller == 0) {
				cage.label = "" + (larger / smaller) + "÷";
			} else {
				cage.label = "" + (larger - smaller) + "-";
			}
		} else {
			if (Math.random() < 0.5) {
				var s = 0;
				for (var i = 0; i < els.length; i++) {
					s += els[i];
				}
				cage.label = "" + s + "+";
			} else {
				var p = 1;
				for (var i = 0; i < els.length; i++) {
					p *= els[i];
				}
				cage.label = "" + p + "×";
			}
		}
		// console.log(cage);
		cages.push(cage);
	}
	return cages;
}


function get_number_grid() {
	var root = {grid:[], depth:0};
	for (var i = 0; i < num_squares * num_squares; i++) {
		root.grid.push(0);
	}
	var stack = [root];
	while (stack.length > 0) {
		var parent = stack.pop();
		if (parent.depth == num_squares * num_squares) {
			return parent.grid;
		}
		stack.push(...shuffle(get_children(parent)));
	}
}


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


function show_solution() {
	board = [...solution];
	update_display();
}


function check() {
	if (is_solved(board)) {
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


function is_solved(b) {
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

	for (var i = 0; i < cages.length; i++) {
		if (!check_cage(cages[i])) {
			return false;
		}
	}

	return true;
}


function check_cage(cage) {
	if (cage.label.length == 1) {
		return (board[cage.locs[0]] == Number(cage.label));
	}

	var els = [];
	for (var i = 0; i < cage.locs.length; i++) {
		els.push(board[cage.locs[i]]);
	}
	var larger = Math.max(...els);
	var smaller = Math.min(...els);

	if (cage.label[1] == "-") {
		return (larger - smaller) == Number(cage.label[0]);
	} else if (cage.label[1] == "÷") {
		return (larger / smaller) == Number(cage.label[0]);
	} else if (cage.label[1] == "+") {
		var s = 0;
		for (var i = 0; i < els.length; i++) {
			s += els[i];
		}
		return s == Number(cage.label[0]);
	} else {
		var p = 1;
		for (var i = 0; i < els.length; i++) {
			p *= els[i];
		}
		return p == Number(cage.label[0]);
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
		ctx.fillText(cage.label, x + square_size * 0.1, y + square_size * 0.25);
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
	if (selected_square_id != -1) {
		var x = (selected_square_id % num_squares) * square_size;
		var y = Math.floor(selected_square_id / num_squares) * square_size;
		ctx.shadowBlur = 8;
		ctx.shadowColor = "blue";
		ctx.lineWidth = 3;
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
