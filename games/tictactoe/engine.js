
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const HEIGHT = canvas.height;
const WIDTH = canvas.width;

const X = 1;
const O = 2;
const UNFINISHED = -2;
const TIE = -1;

const BLANK = 0;

const SQUARE_WIDTH = 100;
const MARGIN = 50;
const LINE_WIDTH = 4; // works best if this is even

const WINNING_COMBOS = [[0,1,2], [3,4,5], [6,7,8],
                        [0,3,6], [1,4,7], [2,5,8],
                        [0,4,8], [2,4,6]];

var board;
var current_player;

reset_game();


function reset_game() {
    // reset board representation array
    board = [0,0,0,0,0,0,0,0,0];

    // clear display
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // add the grid lines
    ctx.fillStyle = "grey";
    for (var i = 1; i <= 2; i++) {
      var a = MARGIN - LINE_WIDTH / 2;
      var b = MARGIN + i * SQUARE_WIDTH - LINE_WIDTH / 2;
      ctx.fillRect(a, b, SQUARE_WIDTH * 3, LINE_WIDTH);
      ctx.fillRect(b, a, LINE_WIDTH, SQUARE_WIDTH * 3);
    }

    // reset current player
    current_player = X;
    ctx.fillStyle = "black";
    ctx.font = "50px Arial";
    ctx.fillText("It is X's turn", MARGIN * 1.5, MARGIN * 2 + 3 * SQUARE_WIDTH + 25);
}





canvas.addEventListener('click', game_step);

function game_step() {
  // check the game state with get_game_state()
  var game_state = get_game_state();
  // if the game is over
  if (game_state != UNFINISHED) {
    // reset via reset_game()
    reset_game();
    return;
  }

  // get the coordinate that was clicked
  var rect = canvas.getBoundingClientRect();
	var user_x = (event.clientX - rect.left) * (canvas.width / canvas.clientWidth);
	var user_y = (event.clientY - rect.top) * (canvas.height / canvas.clientHeight);

  // otherwise, if the user clicked on the board
  if (user_x > MARGIN && user_y > MARGIN && user_y < SQUARE_WIDTH * 3 + MARGIN && user_x < SQUARE_WIDTH * 3 + MARGIN) {

    // get the row and column that was clicked
    var row = ((user_y - MARGIN) - ((user_y - MARGIN) % SQUARE_WIDTH)) / SQUARE_WIDTH;
    var col = ((user_x - MARGIN) - ((user_x - MARGIN) % SQUARE_WIDTH)) / SQUARE_WIDTH;
    var square_num = row * 3 + col;

    // if the square is empty
    if (board[square_num] == BLANK) {

      // update the board array
      board[square_num] = current_player;

      // update the display with add_mark(square_num)
      add_mark(square_num);

      // check the game state again
      game_state = get_game_state();

      // reset context to update message
      ctx.clearRect(0, MARGIN + SQUARE_WIDTH * 3, WIDTH, HEIGHT - MARGIN * 2 - 3 * SQUARE_WIDTH);
      ctx.fillStyle = "black";
      ctx.font = "50px Arial";

      // if the game is not over,
      if (game_state == UNFINISHED) {
        // switch player
        current_player = X + O - current_player;
        // update message
        ctx.fillText("It is " + (current_player == X ? "X" : "O") + "'s turn", MARGIN * 1.5, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
      }

      // if a player won
      else if (game_state == X || game_state == O) {
        // update message
        ctx.fillText((current_player == X ? "X" : "O") + " wins!", MARGIN * 2.5, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
      }

      // if it is a draw
      else {
         // update message
        ctx.fillText("Draw!", MARGIN * 2.8, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
      }
      // print message to reset
      if (game_state != UNFINISHED) {
          ctx.font = "20px Arial";
          ctx.fillText("Click the board to reset.", MARGIN * 2, MARGIN * 3 + 3*SQUARE_WIDTH + 10);
      }
    }
  }
}



function get_game_state() {
  // search board array for three same marks in a row with find_three()
  var three = find_three();
  // if there are three in a row
  if (three[0] != -1) {
    // return the winner, X or O
      return board[three[0]];
  }
  // else if the game board is not full, return UNFINISHED
  for (i = 0; i < 9; i++) {
    if (board[i] == 0) {
      return UNFINISHED;
    }
  }
  // otherwise the game ended in a tie, so return TIE
  return TIE;
}

function find_three() {
  // iterate over every possible three-in-a-row combos
  for (i = 0; i < WINNING_COMBOS.length; i++) {
    var combo = WINNING_COMBOS[i];
    var a = board[combo[0]];
    var b = board[combo[1]];
    var c = board[combo[2]];
    // if there is a three in a row
    if (a != BLANK && a === b && b === c) {
      // return the array of board indices
      return combo;
    }
  }
  // if there is no three-in-a-row,
    // return [-1]
  return [-1];
}

function add_mark(square_num) {
  // use square_num to get the x and y coordinates for placing the image
  var x = MARGIN + SQUARE_WIDTH * (square_num % 3) + SQUARE_WIDTH * 0.2;
  var y = MARGIN + SQUARE_WIDTH * Math.floor(square_num / 3) + SQUARE_WIDTH * 0.2;

  // draw the image
  // create an image object
  var image = new Image();
  // set the image source depending on the
  if (board[square_num] == X) {
    image.src = "X.png";
  } else {
    image.src = "O.png";
  }
  image.onload = function() {
    // add the image to the canvas
    ctx.drawImage(image, x, y, SQUARE_WIDTH * 0.6, SQUARE_WIDTH * 0.6);

    // draw winning line
    draw_winning_line();
  }

  // print to the console
  console.log(["X", "O"][current_player - 1] + " clicks square " + square_num);
}


function draw_winning_line() {
  // find three
  var three = find_three();
  // if we find three-in-a-row
  if (three[0] != -1) {
    // find endpoints of line
    x1 = MARGIN + ((three[0] % 3) + 0.5) * SQUARE_WIDTH;
    y1 = MARGIN + (Math.floor(three[0] / 3) + 0.5) * SQUARE_WIDTH;
    x2 = MARGIN + ((three[2] % 3) + 0.5) * SQUARE_WIDTH;
    y2 = MARGIN + (Math.floor(three[2] / 3) + 0.5) * SQUARE_WIDTH;
    // make adjustments
    // vertical
    if (x1 == x2) {
      y1 -= SQUARE_WIDTH * 0.2;
      y2 += SQUARE_WIDTH * 0.2;
    }
    // horizontal
    else if (y1 == y2) {
      x1 -= SQUARE_WIDTH * 0.2;
      x2 += SQUARE_WIDTH * 0.2;
    }
    // top-right to bottom-left diagonal
    else if (x1 == y2) {
      x1 += SQUARE_WIDTH * 0.2;
      y1 -= SQUARE_WIDTH * 0.2;
      x2 -= SQUARE_WIDTH * 0.2;
      y2 += SQUARE_WIDTH * 0.2;
    }
    // top-left to bottom-right diagonal
    else {
      x1 -= SQUARE_WIDTH * 0.2;
      y1 -= SQUARE_WIDTH * 0.2;
      x2 += SQUARE_WIDTH * 0.2;
      y2 += SQUARE_WIDTH * 0.2;
    }
    // draw line
    ctx.strokeStyle = "red";
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
