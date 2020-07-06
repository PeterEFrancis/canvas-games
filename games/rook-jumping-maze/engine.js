
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");


const SIZE = canvas.height;
const LINE_WIDTH = 4;


var num_squares = 5;
var square_size = SIZE / num_squares;

var board;
var move_history;
var current_pos;
var next_moves;
var moves;
var min_moves;
var solution;


function change_num_squares(amount) {
	document.getElementById('minus').disabled = false;
	document.getElementById('plus').disabled = false;
	if (num_squares + amount > 2 && num_squares + amount < 11) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		new_maze();
	}
	if (num_squares == 3) {
		document.getElementById('minus').disabled = true;
	} else if (num_squares == 10) {
		document.getElementById('plus').disabled = true;
	}
}


function click(square_id) {
	if (next_moves.includes(square_id)) {
		move_history.push(current_pos);
		current_pos = square_id;
		next_moves = get_next_moves(board, current_pos);
		moves += 1;
		update_display();
	}
}


function undo() {
	if (move_history.length > 0) {
		moves -= 1;
		current_pos = move_history.pop();
		next_moves = get_next_moves(board, current_pos);
		update_display();
	}
}


function get_next_moves(b, cp) {
	nm = [];
	var dir = [1, -1, num_squares, -num_squares];
	for (var i = 0; i < 4; i++) {
		var vec = dir[i] * b[cp];
		var move = cp + vec;
		var c_row = Math.floor(cp / num_squares);
		var c_col = cp % num_squares;
		var n_row = Math.floor((cp + vec) / num_squares);
		var n_col = (cp + vec) % num_squares;
		if (move < num_squares * num_squares && move >= 0) {
			if (c_row == n_row || c_col == n_col) {
				nm.push(move);
			}
		}
	}
	return nm;
}


function update_display() {

	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	for (var i = 0; i < num_squares * num_squares; i++) {
		var text = board[i] == 0 ? "G" : board[i];
		ctx.font = (square_size * 0.85) + "px monospace";
		var x = (i % num_squares) * square_size;
		var y = (Math.floor(i / num_squares) + 1) * square_size;
		if (next_moves.includes(i)) {
			ctx.shadowBlur = 40;
			ctx.shadowColor = "red";
		} else if (i == current_pos) {
			ctx.shadowBlur = 40;
			ctx.shadowColor = "blue";
		} else if (board[i] == 0) {
			ctx.shadowBlur = 40;
			ctx.shadowColor = "gold";
		} else {
			ctx.shadowBlur = 0;
		}
		ctx.fillText(text, x + (square_size * 0.25), y - (square_size * 0.25));
	}
	ctx.shadowBlur = 0;

	// add the grid lines
	ctx.fillStyle = "black";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2, SIZE, LINE_WIDTH);
		ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
	}

	// place current position circle
	ctx.beginPath();
	var x = (current_pos % num_squares) * square_size + square_size / 2;
	var y = Math.floor(current_pos / num_squares) * square_size + square_size / 2;
	ctx.arc(x, y, square_size * 0.45, 2 * Math.PI, false);
	ctx.lineWidth = 5;
	ctx.stroke();

	// set moves counter
	document.getElementById('moves').innerHTML = moves;
	document.getElementById('min-moves').innerHTML = min_moves;

}


function new_maze() {

	// make a new board
	// board = get_random_maze();
	board = get_solvable_maze();

	// reset current position
	current_pos = 0;

	// reset next_moves
	next_moves = get_next_moves(board, current_pos);

	// reset moves counter
	moves = 0;

	// reset move_history
	move_history = [];

	// set goal
	// board[Math.floor(Math.random() * (board.length - 1)) + 1] = 0;
	board[board.length - 1] = 0;

	// hide solution
	document.getElementById('solution').innerHTML = "";

	update_display();
}


function get_max_square_val(tile) {
	return Math.max(tile % num_squares,
		              Math.floor(tile / num_squares),
		              num_squares - (tile % num_squares) - 1,
		              num_squares - Math.floor(tile / num_squares) - 1);
}


function has_dead_ends(b) {
	for (var i = 0; i < num_squares * num_squares - 1; i++) {
		var nm1 = get_next_moves(b, i);
		for (var j = 0; j < nm1.length; j++) {
			var nm2 = get_next_moves(b, nm1[j]);
			if (nm2.length == 1 && nm2[0] == i) {
				return true;
			}
		}
	}
	return false;
}


function randomize() {
	var b = [];
	for (var i = 0; i < num_squares * num_squares - 1; i++) {
		b.push(Math.floor(Math.random() * get_max_square_val(i)) + 1);
	}
	b.push(0);
	return b;
}


function get_random_maze() {
	var b;
	do {
		b = randomize();
	} while (has_dead_ends(b));
	return b;
}


function interpret_solution() {
	var s = "";
	var diff;
	for (var i = 1; i < solution.length; i++) {
		diff = solution[i] - solution[i - 1];
		if (diff == board[solution[i - 1]]) {
			s += "R";
		} else if (diff == - board[solution[i - 1]]) {
			s += "L";
		} else if (diff > board[solution[i - 1]]) {
			s += "D";
		} else {
			s += "U";
		}
	}
	return s;
}


function toggle_solution() {
	if (document.getElementById('solution').innerHTML == "") {
			document.getElementById('solution').innerHTML = interpret_solution();
	} else {
		document.getElementById('solution').innerHTML = "";
	}
}


function get_solvable_maze() {
	var rjm = new RookJumpingMaze();
	var minState = (new HillDescender(rjm, 0.005)).search(5000);
	solution = minState.findSolution();
	min_moves = solution.length - 1;
	return minState.maze;
 }



class HillDescender {
		constructor(initState, acceptRate) {
				this.state = initState;
				this.energy = initState.energy();
				this.minState = this.state.clone();
				this.minEnergy = this.energy;
				this.acceptRate = acceptRate; // when acceptRate is 0, it is a strict hill descent algorithm
		}
		search(iterations) {
			for (let i = 0; i < iterations; i++) {
				// if (i % 10000 == 0) {
				// 	console.log("Min Energy: " + minEnergy + "\t" + "Energy: " + energy);
				// }
				this.state.step();
				let nextEnergy = this.state.energy();
				if (nextEnergy <= this.energy || Math.random() < this.acceptRate) { // = prevents you from getting stuck on a plateau
					this.energy = nextEnergy;
					if (nextEnergy < this.minEnergy) {
						this.minState = this.state.clone();
						this.minEnergy = nextEnergy;
					}
				}
				else {
					this.state.undo(); // the nextEnergy was greater than energy so we must have stepped uphill
				}
			}
				return this.minState;
		}
}

class RookJumpingMaze {

	constructor() {
		this.maze = get_random_maze();
		this.prev_tile = -1;
		this.prev_val = -1;
	}

	get_jump(row, col) {
		return maze[row * num_squares + col];
	}

	step() {
		let tile;
		do {
			tile = Math.floor(Math.random() * (num_squares * num_squares - 1));
		} while (num_squares == 3 && tile == 4);

		this.prev_tile = tile;
		this.prev_val = this.maze[tile];

		let row = Math.floor(tile / num_squares);
		let col = tile % num_squares;
		let new_val;

		var count = 0
		do {
			count++;
			new_val = Math.floor(Math.random() * get_max_square_val(tile)) + 1;
			this.maze[tile] = new_val;
			if (count == num_squares) {
				this.maze[tile] = this.prev_val;
				break;
			}
		} while (new_val == this.prev_val || has_dead_ends(this.maze));

	}

	undo() {
		this.maze[this.prev_tile] = this.prev_val;
	}

	energy() {
		return -this.findMinimumDistance();
	}

	findMinimumDistance() {

		let queue = [[0,0]];
		let visited = this.initializeVisited();

		while (queue.length > 0) {
			let curr = queue.shift();

			// check if it is a goal
			if (curr[0] == num_squares * num_squares - 1) {
				return curr[1];
			}

			// expand the children
			let child = [0, 0];
			for (let dir = 0; dir < 4; dir++) {
				child = this.isLegalMove(dir, curr, visited);
				if (child != null) {
					visited[child[0]] = 0;
					queue.push(child);
				}
			}
		}
		return -1000000;
	}

	findSolution() {

		let queue = [[0,0,[]]];
		let visited = this.initializeVisited();

		while (queue.length > 0) {
			let curr = queue.shift();

			// check if it is a goal
			if (curr[0] == num_squares * num_squares - 1) {
				return [...curr[2], curr[0]];
			}

			// expand the children
			let child;
			for (let dir = 0; dir < 4; dir++) {
				child = this.isLegalMove(dir, curr, visited);
				if (child != null) {
					child.push([...curr[2], curr[0]]);
					visited[child[0]] = 0;
					queue.push(child);
				}
			}
		}
		return -1000000;
	}

	isLegalMove(dir, parent, visited) {
		let row = Math.floor(parent[0] / num_squares);
		let col = parent[0] % num_squares;
		let depth = parent[1] + 1;
		let moveVal = this.maze[parent[0]];

		let p;

		// moving north
		if (dir == 0) {
			if (row - moveVal >= 0) {
				p = (row - moveVal) * num_squares + col;
				if (visited[p] == -1) {
					return [p, depth];
				}
			}
		}

		// moving east
		else if (dir == 1) {
			if (col + moveVal < num_squares) {
				p = row * num_squares + col + moveVal;
				if (visited[p] == -1) {
					return [p, depth];
				}
			}
		}

		// moving south
		else if (dir == 2) {
			if (row + moveVal < num_squares) {
				p = (row + moveVal) * num_squares + col;
				if (visited[p] == -1) {
					return [p, depth];
				}
			}
		}

		// moving west
		else if(dir == 3) {
			if (col - moveVal >= 0) {
				p = row * num_squares + col - moveVal;
				if (visited[p] == -1) {
					return [p, depth];
				}
			}
		}

		return null;
	}

	initializeVisited() {
		let visited = [];
		for (let i = 0; i < num_squares * num_squares; i++) {
			visited[i] = -1;
		}
		visited[0] = 0;

		return visited;
	}

	clone() {
		let rjm = new RookJumpingMaze();
		rjm.maze = [...this.maze];
		rjm.prev_val = this.prev_val;
		rjm.prev_tile = this.prev_tile;
		return rjm;
	}

}
