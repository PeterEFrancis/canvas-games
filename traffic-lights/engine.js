
const NUM_ROWS = 3;
const NUM_COLS = 4;
const HEIGHT = 450;
const WIDTH = 600;
const SQUARE_WIDTH = 150;
const LINE_WIDTH = 2; // works best if this is even


const LINES = [ [0,1,2], [1,2,3], [4,5,6], [5,6,7], [8,9,10], [9,10,11],
                [0,4,8], [1,5,9], [2,6,10], [3,7,11],
                [0,5,10], [1,6,11],
                [2,5,8], [3,6,9]
            ];

const BLANK = 0;
const GREEN = 1;
const YELLOW = 2;
const RED = 3;


const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");


// state representation of the board
var board = [0,0,0,0,0,0,0,0,0,0,0,0];
// current player is either 1 or 2
var current_player = 1;
// if game_over, the board cannot be changed
var game_over = false;
//
var history_squares = [];


function reset_board() {
    game_over = false;
    blank = true;
    board = [0,0,0,0,0,0,0,0,0,0,0,0];
    history_squares = [];

    // reset current player
    current_player = 1;
    document.getElementById("one").style.backgroundColor = "purple";
    document.getElementById("two").style.backgroundColor = "transparent";

    // celar board
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // add the grid lines
    ctx.fillStyle = "lightgrey";
    for (var i = 0; i <= 4; i++) {
      ctx.fillRect(0 - LINE_WIDTH / 2, i * SQUARE_WIDTH - LINE_WIDTH / 2, WIDTH, LINE_WIDTH);
      ctx.fillRect(i * SQUARE_WIDTH - LINE_WIDTH / 2, 0 - LINE_WIDTH / 2, LINE_WIDTH, HEIGHT);
      // yes, one of these falls over the edge and doesn't get displayed, but that is ok
    }
}

function is_game_over() {
    for (i = 0; i < LINES.length; i++) {
        var line = LINES[i];
        var a = board[line[0]];
        var b = board[line[1]];
        var c = board[line[2]];
        if (a != 0 && a === b && b === c) {
            return true;
        }
    }
    return false;
}

function update_square_display(square_num) {
    var col = square_num % NUM_COLS;
    var row = Math.floor(square_num / NUM_COLS);

    // clear the square that was clicked
    var top_left_x = col * SQUARE_WIDTH;
    var top_left_y = row * SQUARE_WIDTH;
    ctx.clearRect(top_left_x + LINE_WIDTH / 2, top_left_y + LINE_WIDTH / 2, SQUARE_WIDTH - LINE_WIDTH, SQUARE_WIDTH - LINE_WIDTH);
    // add shape
    var size = SQUARE_WIDTH * 0.3;
    var center_x = top_left_x + SQUARE_WIDTH / 2;
    var center_y = top_left_y + SQUARE_WIDTH / 2;
    if (board[square_num] == GREEN) {
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(center_x - size, center_y - size, size * 2, size * 2);
    } else if (board[square_num] == YELLOW) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(center_x, center_y - size);
        ctx.lineTo(center_x + size, center_y + size)
        ctx.lineTo(center_x - size, center_y + size)
        ctx.closePath()
        ctx.fill();
    } else if (board[square_num] == RED) {
        ctx.fillStyle = "#ff5757";
        ctx.beginPath();
        ctx.arc(center_x, center_y, size, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function switch_players() {
    document.getElementById(["one", "two"][current_player - 1]).style.backgroundColor = "transparent";
    current_player = 3 - current_player;
    document.getElementById(["one", "two"][current_player - 1]).style.backgroundColor = "purple";
}

function game_step() {
    if (!game_over) {
        // get the square number that was clicked
        var rect = canvas.getBoundingClientRect();
        var user_x = event.clientX - rect.left;
        var user_y = event.clientY - rect.top;
        var row = (user_y - (user_y % SQUARE_WIDTH)) / SQUARE_WIDTH;
        var col = (user_x - (user_x % SQUARE_WIDTH)) / SQUARE_WIDTH;
        var square_num = row * NUM_COLS + col;

        if (board[square_num] < RED) {

            // increment the board array
            board[square_num] += 1;

            // add square to history
            history_squares.push(square_num);

            // change the board display (this could be replaced by just clearing and resetting the entire board)
            update_square_display(square_num);

            // check for game winner
            game_over = is_game_over();
            if (game_over) {
                ctx.fillStyle = "rgb(75,75,75,0.9)";
                ctx.fillRect(SQUARE_WIDTH / 2, SQUARE_WIDTH * 3 / 4, SQUARE_WIDTH * 3, SQUARE_WIDTH * 3/2, 0.5);
                ctx.fillStyle = "lightgrey";
                ctx.font = "60px Arial";
                ctx.fillText("Player " + current_player + " wins!", SQUARE_WIDTH * 3/4, SQUARE_WIDTH * 3/2);
                ctx.font = "20px Arial";
                ctx.fillText("Click 'Reset Board' to start again.", SQUARE_WIDTH * 31/30, SQUARE_WIDTH * 9/5);
                document.getElementById("undo-button").disabled = true;
            } else {
                switch_players();
                document.getElementById("undo-button").disabled = false;
            }
        }

    }



}

function undo_step() {
    if (history_squares.length > 0 && !game_over) {
        var square_num = history_squares.pop();
        board[square_num] -= 1;
        update_square_display(square_num);
        switch_players();
        if (history_squares.length == 0) {
            document.getElementById("undo-button").disabled = true;
        }
    }
}
