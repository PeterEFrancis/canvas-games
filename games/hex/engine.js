
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



const NUM_HEXES = 11;
const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even

const COLORS = ["#FDEFC9", "red", "blue"];

const BLANK = 0;
const RED = 1;
const BLUE = 2;

const HEX_SIDE_LENGTH = 33;
const HEX_RADIUS = HEX_SIDE_LENGTH; // since  sin(PI / 6) = 0.5
const HEX_APOTHEM = Math.sqrt(HEX_RADIUS * HEX_RADIUS - HEX_SIDE_LENGTH * HEX_SIDE_LENGTH / 4);

const CORNER_X = 20;
const CORNER_Y = CORNER_X / Math.tan(Math.PI / 6);
const d = CORNER_X * Math.sin(Math.PI / 6);
const b = d * Math.cos(Math.PI / 6);
const c = b * b / Math.sqrt(d * d - b * b);
const p = Math.sqrt(HEX_SIDE_LENGTH * HEX_SIDE_LENGTH - HEX_APOTHEM * HEX_APOTHEM);
const m = p / Math.tan(Math.PI / 6);

const HEX_OFFSET_X = c + m + HEX_APOTHEM;
const HEX_OFFSET_Y = b + HEX_RADIUS;

const CENTER_X = 15 * HEX_APOTHEM;
const CENTER_Y = 5 * HEX_RADIUS * 3 / 2;

var board;
var current_player;
var history_clicks;
var game_state;


function reset_game() {

	// make a new (blank) board array
	board = [];
	for (var i = 0; i < NUM_HEXES * NUM_HEXES; i++) {
		var hex = {
			id: i,
			state : BLANK,
			x : (i % NUM_HEXES) * 2 * HEX_APOTHEM + Math.floor(i / NUM_HEXES) * HEX_APOTHEM + HEX_OFFSET_X,
			y : Math.floor(i / NUM_HEXES) * HEX_RADIUS * 3 / 2 + HEX_OFFSET_Y
		}
		board.push(hex);
	}

	// reset current_player
	current_player = RED;

	// reset history
	history_clicks = [];

	// reset game_state
	game_state = BLANK;

	update_display();

}


function get_hex_id(hex, x, y) {
	if (x > hex.x - HEX_APOTHEM && x < hex.x + HEX_APOTHEM) {
		if ((-y) < (x - hex.x) * (-p / HEX_APOTHEM) - (hex.y - HEX_APOTHEM)) {
			if ((-y) > (x - hex.x) * (p / HEX_APOTHEM) - (hex.y + HEX_APOTHEM)) {
				if ((-y) < (x - hex.x) * (p / HEX_APOTHEM) - (hex.y - HEX_APOTHEM)) {
					if ((-y) > (x - hex.x) * (-p / HEX_APOTHEM) - (hex.y + HEX_APOTHEM)) {
						return hex.id;
					}
				}
			}
		}
	}
	return -1;
}


function click(hex_id) {
	if (game_state == BLANK) {
		var row = Math.floor(hex_id / NUM_HEXES);
		var col = hex_id % NUM_HEXES;

		if (board[hex_id].state == BLANK) {
			board[hex_id].state = current_player;
			history_clicks.push(hex_id);
			game_state = game_winner();
			if (game_state == BLANK) {
				current_player = RED + BLUE - current_player;
			}
		}
		update_display();
	}
}


function get_neighbor_ids(hex_id) {
	var n = [];
	if (hex_id >= NUM_HEXES) { // if not in the top row
		n.push(hex_id - NUM_HEXES);
		if (hex_id % NUM_HEXES < NUM_HEXES - 1) { // if not in right column
			n.push(hex_id - NUM_HEXES + 1);
		}
	}
	if (hex_id % NUM_HEXES < NUM_HEXES - 1) { // if not in right column
		n.push(hex_id + 1);
	}
	if (hex_id < NUM_HEXES * (NUM_HEXES - 1)) { // if not in bottom row
		n.push(hex_id + NUM_HEXES);
		if (hex_id % NUM_HEXES > 0) { // if not in left column
			n.push(hex_id + NUM_HEXES - 1);
		}
	}
	if (hex_id % NUM_HEXES > 0) { // if not in left column
		n.push(hex_id - 1);
	}
	return n;
}


function game_winner() {
	if (is_winner(RED)) {
		return RED;
	} else if (is_winner(BLUE)) {
		return BLUE;
	}
	return BLANK;
}


function is_winner(player) {
	var already_checked = [];
	var stack = [];
	for (var i = 0; i < NUM_HEXES; i++) {
		var j = i * (player == RED ? 1 : NUM_HEXES);
		if (board[j].state == player) {
			stack.push(j);
			already_checked.push(j);
		}
	}
	while (stack.length > 0) {
		var top = stack.pop();
		if (top >= NUM_HEXES * (NUM_HEXES - 1) && player == RED) {
			return true;
		}
		if (top % NUM_HEXES == NUM_HEXES - 1 && player == BLUE) {
			return true;
		}
		var neighbors = get_neighbor_ids(top);
		for (var i = 0; i < neighbors.length; i++) {
			var n = neighbors[i];
			if (board[n].state == player && !already_checked.includes(n)) {
				stack.push(n);
				already_checked.push(n);
			}
		}
	}
	return false;
}


function draw_hex(hex) {
	ctx.beginPath();
	ctx.moveTo(hex.x, hex.y + HEX_RADIUS);
	ctx.lineTo(hex.x + HEX_APOTHEM, hex.y + HEX_RADIUS * Math.sin(Math.PI/ 6));
	ctx.lineTo(hex.x + HEX_APOTHEM, hex.y - HEX_RADIUS * Math.sin(Math.PI/ 6));
	ctx.lineTo(hex.x, hex.y - HEX_RADIUS);
	ctx.lineTo(hex.x - HEX_APOTHEM, hex.y - HEX_RADIUS * Math.sin(Math.PI/ 6));
	ctx.lineTo(hex.x - HEX_APOTHEM, hex.y + HEX_RADIUS * Math.sin(Math.PI/ 6));
	ctx.lineTo(hex.x, hex.y + HEX_RADIUS);
	ctx.lineWidth = 3;
	ctx.fillStyle = COLORS[hex.state];
	ctx.strokeStyle = "black";
	ctx.fill();
	ctx.stroke();
}


function update_display() {

	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

	// draw background
	ctx.fillStyle = COLORS[RED];
	ctx.beginPath();
	ctx.moveTo(CORNER_X, 0);
	ctx.lineTo(c, b);
	ctx.lineTo(2 * HEX_OFFSET_X + 2 * CENTER_X - c, 2 * CENTER_Y + 2 * HEX_OFFSET_Y - b);
	ctx.lineTo(2 * HEX_OFFSET_X + 2 * CENTER_X - CORNER_X, 2 * CENTER_Y + 2 * HEX_OFFSET_Y);
	ctx.lineTo(CENTER_X - 3 * HEX_APOTHEM - b, 2 * CENTER_Y + 2 * HEX_OFFSET_Y);
	ctx.lineTo(HEX_APOTHEM * 21 + HEX_OFFSET_X, 0);
	ctx.lineTo(CORNER_X, 0);
	ctx.fill();

	ctx.fillStyle = COLORS[BLUE];
	ctx.beginPath();
	ctx.moveTo(CORNER_X * Math.sin(Math.PI / 6), CORNER_X * Math.cos(Math.PI / 6));
	ctx.lineTo(c, b);
	ctx.lineTo(2 * HEX_OFFSET_X + 2 * CENTER_X - c, 2 * CENTER_Y + 2 * HEX_OFFSET_Y - b);
	ctx.lineTo(2 * HEX_OFFSET_X + 2 * CENTER_X - CORNER_X * Math.sin(Math.PI / 6), 2 * CENTER_Y + 2 * HEX_OFFSET_Y - CORNER_X * Math.cos(Math.PI / 6));
	ctx.lineTo(HEX_APOTHEM * 21 + HEX_OFFSET_X, 0);
	ctx.lineTo(CENTER_X - 3 * HEX_APOTHEM - b, 2 * CENTER_Y + 2 * HEX_OFFSET_Y);
	ctx.lineTo(CORNER_X * Math.sin(Math.PI / 6), CORNER_X * Math.cos(Math.PI / 6));
	ctx.fill();

	// draw hexes
	for (var i = 0; i < NUM_HEXES * NUM_HEXES; i++) {
		draw_hex(board[i]);
	}

	// show current player
	document.getElementById('current_player').innerHTML = COLORS[current_player];
	document.getElementById('current_player').style.backgroundColor = COLORS[current_player];

	// winning message
	document.getElementById('result').innerHTML = "";
	if (game_state != BLANK) {
		document.getElementById('result').innerHTML = " wins!";
	}
}


function undo() {
	if (history_clicks.length > 0 && game_state == BLANK) {
		board[history_clicks.pop()].state = BLANK;
		current_player = RED + BLUE - current_player;
	}
	update_display();
}





canvas.addEventListener('click', function() {
	var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);
	for (var i = 0; i < NUM_HEXES * NUM_HEXES; i++) {
		var hex_id = get_hex_id(board[i], user_x, user_y);
		if (hex_id != -1) {
			click(hex_id);
			break;
		}
	}
});
