
const HEIGHT = 500;
const WIDTH = 400;
const SQUARE_WIDTH = 100;
const MARGIN = 50;
const LINE_WIDTH = 4; // works best if this is even

const BLANK = 0;
const X = 1;
const O = 2;
const DEAD_LOCK = -1;
const UNFINISHED = -2;

const WINNING_COMBOS = [[0,1,2], [3,4,5], [6,7,8],
                        [0,3,6], [1,4,7], [2,5,8],
                        [0,4,8], [2,4,6]];

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

var board;
var current_player;

function add_mark(square_num) {
    var x = MARGIN + SQUARE_WIDTH * (square_num % 3) + SQUARE_WIDTH * 0.2;
    var y = MARGIN + SQUARE_WIDTH * Math.floor(square_num / 3) + SQUARE_WIDTH * 0.2;

    var image = new Image();
    if (board[square_num] == X) {
      image.src = "X.png";
    } else {
      image.src = "O.png";
    }

    image.onload = function() {
        ctx.drawImage(image, x, y, SQUARE_WIDTH * 0.6, SQUARE_WIDTH * 0.6);

        // draw winning line
        draw_winning_line();
    }

}

function reset_game() {
    board = [0,0,0,0,0,0,0,0,0];

    // clear display
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // add the grid lines
    ctx.fillStyle = "grey";
    for (var i = 1; i <= 2; i++) {
      ctx.fillRect(MARGIN - LINE_WIDTH / 2, MARGIN + i * SQUARE_WIDTH - LINE_WIDTH / 2, SQUARE_WIDTH * 3, LINE_WIDTH);
      ctx.fillRect(MARGIN + i * SQUARE_WIDTH - LINE_WIDTH / 2, MARGIN - LINE_WIDTH / 2, LINE_WIDTH, SQUARE_WIDTH * 3);
    }

    // reset current player
    current_player = X;
    ctx.fillStyle = "black";
    ctx.font = "50px Arial";
    ctx.fillText("It is X's turn", MARGIN * 1.5, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
}

function find_three () {
  for (i = 0; i < WINNING_COMBOS.length; i++) {
      var combo = WINNING_COMBOS[i];
      var a = board[combo[0]];
      var b = board[combo[1]];
      var c = board[combo[2]];
      if (a != BLANK && a === b && b === c) {
        return combo;
      }
  }
  return [-1];
}

function get_game_state() {
    var three = find_three();
    if (three[0] != -1) {
      return board[three[0]]; // X or O
    }
    for (i = 0; i < 9; i++) {
      if (board[i] == 0) {
        return UNFINISHED;
      }
    }
    return DEAD_LOCK;
}

function game_step() {
    if (get_game_state() != UNFINISHED) {
      reset_game();
      return;
    }

    // get the square number that was clicked
    var rect = canvas.getBoundingClientRect();
    var user_x = event.clientX - rect.left;
    var user_y = event.clientY - rect.top;

    if (user_x > MARGIN && user_y > MARGIN && user_y < SQUARE_WIDTH * 3 + MARGIN && user_x < SQUARE_WIDTH * 3 + MARGIN) {

      var row = ((user_y - MARGIN) - ((user_y - MARGIN) % SQUARE_WIDTH)) / SQUARE_WIDTH;
      var col = ((user_x - MARGIN) - ((user_x - MARGIN) % SQUARE_WIDTH)) / SQUARE_WIDTH;
      var square_num = row * 3 + col;

      if (board[square_num] == BLANK) {

          // set the board array
          board[square_num] = current_player;

          // change the board display (this could be replaced by just clearing and resetting the entire board)
          add_mark(square_num);

          // check game state and update message
          ctx.clearRect(0, MARGIN + SQUARE_WIDTH * 3, WIDTH, HEIGHT - MARGIN * 2 - 3 * SQUARE_WIDTH);
          game_state = get_game_state();
          ctx.fillStyle = "black";
          ctx.font = "50px Arial";
          if (game_state == UNFINISHED) {
              current_player = X + O - current_player;
              ctx.fillText("It is " + (current_player == X ? "X" : "O") + "'s turn", MARGIN * 1.5, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
              // switch players
          } else if (game_state == X || game_state == O) {
              ctx.fillText((current_player == X ? "X" : "O") + " wins!", MARGIN * 2.5, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
          } else {
              ctx.fillText("Draw!", MARGIN * 2.8, MARGIN * 2 + 3*SQUARE_WIDTH + 25);
          }
          if (game_state != UNFINISHED) {
              ctx.font = "20px Arial";
              ctx.fillText("Click the board to reset.", MARGIN * 2, MARGIN * 3 + 3*SQUARE_WIDTH + 10);
          }
      }

    }

}

function draw_winning_line() {
    var three = find_three();
    if (three[0] != -1) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 15;
        ctx.beginPath();
        x1 = MARGIN + ((three[0] % 3) + 0.5) * SQUARE_WIDTH;
        y1 = MARGIN + (Math.floor(three[0] / 3) + 0.5) * SQUARE_WIDTH;
        x2 = MARGIN + ((three[2] % 3) + 0.5) * SQUARE_WIDTH;
        y2 = MARGIN + (Math.floor(three[2] / 3) + 0.5) * SQUARE_WIDTH;
        if (x1 == x2) {
          y1 -= SQUARE_WIDTH * 0.2;
          y2 += SQUARE_WIDTH * 0.2;
        } else if (y1 == y2) {
          x1 -= SQUARE_WIDTH * 0.2;
          x2 += SQUARE_WIDTH * 0.2;
        } else if (x1 == y2) {
          x1 += SQUARE_WIDTH * 0.2;
          y1 -= SQUARE_WIDTH * 0.2;
          x2 -= SQUARE_WIDTH * 0.2;
          y2 += SQUARE_WIDTH * 0.2;
        } else {
          x1 -= SQUARE_WIDTH * 0.2;
          y1 -= SQUARE_WIDTH * 0.2;
          x2 += SQUARE_WIDTH * 0.2;
          y2 += SQUARE_WIDTH * 0.2;
        }
        console.log(three);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}
