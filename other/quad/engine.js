
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even


var num_squares = 12;
var square_size = SIZE / num_squares;
var board = [];

var prev_turn;
var turn;

const RED = 1;
const BLUE = 2;




function change_num_squares(amount) {
	if (num_squares + amount > 0) {
		num_squares += amount;
		square_size = SIZE / num_squares;
		clear_board();
	}
}




function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	for (var i = 0; i < num_squares * num_squares; i++) {
		if (board[i] > 0) {
			ctx.fillStyle = ["red", "blue"][board[i] - 1];
			let x = (i % num_squares) * (square_size);
			let y = (Math.floor(i / num_squares)) * (square_size);
			ctx.fillRect(x, y, square_size, square_size);
		}
	}

	// add the grid lines
	ctx.fillStyle = "black";
	for (var i = 0; i <= num_squares + 1; i++) {
		ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2, SIZE, LINE_WIDTH);
		ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
		// yes, one of these falls over the edge and doesn't get displayed, but that is ok
	}

	// score
	document.getElementById('score').innerHTML =  Math.max(0, ...get_polygons().map(x => x.length));

	// turn
	let turn_badge = document.getElementById('turn');
	turn_badge.innerHTML = ['Red', 'Blue'][turn - 1];
	turn_badge.style.backgroundColor = ['red', 'blue'][turn - 1];

}




function clear_board() {
	for (var i = 0; i < num_squares * num_squares; i++) {
		board[i] = 0;
	}
	prev_turn = RED;
	turn = BLUE;
	update_display();
}



function get_loc(e) {
  let rect = canvas.getBoundingClientRect();
  let user_x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  let user_y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  return [user_x, user_y];
}


function click(square_id) {
	if (board[square_id] == 0) {
		board[square_id] = turn;
		if (turn == BLUE) {
			prev_turn = BLUE;
			turn = RED;
		} else if (turn == RED) {
			if (prev_turn == RED) {
				turn = BLUE;
			}
			prev_turn = RED;
		}
	}
}




canvas.addEventListener('click', function(e) {
	let loc = get_loc(e);
	var row = Math.floor(loc[1] / (SIZE / num_squares));
	var col = Math.floor(loc[0] / (SIZE / num_squares));
	click(row * num_squares + col);
	update_display();
});



function next_to(a, b) {
	let ra = Math.floor(a / num_squares);
	let rb = Math.floor(b / num_squares);
	let ca = a % num_squares;
	let cb = b % num_squares;
	return (Math.abs(ra - rb) == 1 && ca == cb) || (Math.abs(ca - cb) == 1 && ra == rb);
}

function get_polygons() {
	let all_squares = [];
	for (let i = 0; i < num_squares ** 2; i++) {
		all_squares.push(i);
	}
	let polygons = [];
	while (all_squares.length > 0) {
		let sq = all_squares.pop();
		if (board[sq] == BLUE) {
			let found_poly = false;
			for (let poly of polygons) {
				for (let sq2 of poly) {
					if (next_to(sq, sq2)) {
						poly.push(sq);
						found_poly = true;
						break;
					}
				}
				if (found_poly) {
					break;
				}
			}
			if (!found_poly) {
				polygons.push([sq]);
			}
		}
	}
	return polygons;
}
