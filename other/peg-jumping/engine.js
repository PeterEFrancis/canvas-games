
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even

const BLANK = 0;
const PEG = 1;

const MODE_TOGGLE_PEG = 0;
const MODE_JUMP = 1;



var num_squares = 10;
var square_size = SIZE / num_squares;
var board = [];
var mode = MODE_TOGGLE_PEG;
var selected_peg = null;
var possibilities = [];


function forget() {
  selected_peg = null;
  possibilities = [];
}

function set_selected(square_id) {
  selected_peg = square_id;
  get_possibilities();
}



function is_blank(square_id) {
  return board[square_id] == BLANK;
}

function is_peg(square_id) {
  return board[square_id] == PEG;
}

function toggle_peg(square_id) {
  board[square_id] = PEG + BLANK - board[square_id];
}

function add_peg(square_id) {
  board[square_id] = PEG;
}

function remove_peg(square_id) {
  board[square_id] = BLANK;
}







function change_num_squares(amount) {
  if (num_squares + amount > 3) {
    num_squares += amount;
    square_size = SIZE / num_squares;
    if (amount == 2) {
      // update board
      new_board = [];
      for (let i = 0; i < num_squares; i++) {
        new_board.push(BLANK);
      }
      for (let i = 0; i < Math.sqrt(board.length); i++) {
        new_board.push(BLANK);
        for (let j = 0; j < Math.sqrt(board.length); j++) {
          new_board.push(board[i * Math.sqrt(board.length) + j]);
        }
        new_board.push(BLANK);
      }
      for (let i = 0; i < num_squares; i++) {
        new_board.push(BLANK);
      }
      board = new_board;
      // update selected
      if (selected_peg) {
        selected_peg = selected_peg + num_squares + 2 * Math.floor(selected_peg / (num_squares - 2)) + 1;
      }
      // update possibilities
      possibilities = possibilities.map(x => x + num_squares + 2 * Math.floor(x / (num_squares - 2)) + 1);
    }
    else {
      new_board = [];
      for (let i = 1; i < num_squares + 1; i++) {
        for (let j = 1; j < num_squares + 1; j++) {
          new_board.push(board[i * (num_squares + 2) + j]);
        }
      }
      board = new_board;
      // update selected
      if (selected_peg) {
        selected_peg = selected_peg - num_squares - 2 * Math.floor(selected_peg / (num_squares + 2)) - 1;
      }
      // update possibilities
      possibilities = possibilities.map(x => x - num_squares - 2 * Math.floor(x / (num_squares + 2)) - 1);
    }
    update_display();
  }
  else {
    clear_board();
  }
  document.getElementById('minus').disabled = num_squares == 4;
  document.getElementById('plus').disabled = num_squares == 36;
}


function toggle_mode() {
  let btn = document.getElementById('mode');
  if (mode == MODE_TOGGLE_PEG) {
    mode = MODE_JUMP;
    btn.style.color = "red";
    btn.style.backgroundColor = "white";
    btn.innerHTML = 'Mode: Jump';
    update_display();
  } else {
    mode = MODE_TOGGLE_PEG;
    btn.style.color = "white";
    btn.style.backgroundColor = "red";
    btn.innerHTML = 'Mode: Toggle Pegs';
    forget()
    update_display();
  }
}





function get_square_id(e) {
  let rect = canvas.getBoundingClientRect();
  let user_x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  let user_y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  let row = Math.floor(user_y / (SIZE / num_squares));
  let col = Math.floor(user_x / (SIZE / num_squares));
  return row * num_squares + col;
}


function get_possibilities() {
  possibilities = [];
  let dirs = [];
  let r = selected_peg % num_squares;
  let c = Math.floor(selected_peg / num_squares);
  if (r < num_squares - 2) {
    dirs.push(1);
  }
  if (r > 1) {
    dirs.push(-1);
  }
  if (c < num_squares - 2) {
    dirs.push(num_squares);
  }
  if (c > 1) {
    dirs.push(-num_squares);
  }
  for (let i = 0; i < dirs.length; i++) {
    if (is_peg(selected_peg + dirs[i]) && is_blank(selected_peg + 2 * dirs[i])) {
      possibilities.push(selected_peg + 2 * dirs[i]);
    }
  }
}


function jump(square_id) {
  remove_peg(selected_peg);
  remove_peg(Math.floor((selected_peg + square_id) / 2));
  add_peg(square_id);
  forget();
}



canvas.addEventListener('click', function(e) {
  let square_id = get_square_id(e);
  if (mode == MODE_TOGGLE_PEG) {
    toggle_peg(square_id);
  } else {
    if (selected_peg == null) {
      if (is_peg(square_id)) {
        set_selected(square_id);
      }
    } else {
      if (possibilities.includes(square_id)){
        jump(square_id);
      } else if (is_peg(square_id) && selected_peg != square_id) {
        set_selected(square_id);
      } else {
        forget();
      }
    }
  }
  update_display();
});




function clear_board() {
  // make a new (blank) board array
  board = [];
  for (let i = 0; i < num_squares * num_squares; i++) {
    board.push(BLANK);
  }
  forget();
  update_display();
}







function update_display() {
  // clear the display
  ctx.clearRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < num_squares * num_squares; i++) {

    let x = (i % num_squares) * (square_size);
    let y = Math.floor(i / num_squares) * (square_size);

    // draw icon
    if (selected_peg == i) {
      ctx.fillStyle = "grey";
      ctx.fillRect(x, y, square_size, square_size);
    }
    if (possibilities.includes(i)) {
      ctx.fillStyle = "green";
      ctx.fillRect(x + square_size / 3, y + square_size / 3, square_size / 3, square_size / 3);
    }
    if (is_peg(i)) {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(x + square_size / 2, y + square_size / 2, square_size / 3, 0, 2 * Math.PI);
      ctx.fill();
    }

  }

  // add the grid lines
  ctx.fillStyle = "black";
  for (var i = 0; i <= num_squares + 1; i++) {
    ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2 - (i == num_squares / 2  ? 2 : 0), SIZE, LINE_WIDTH * (i == num_squares / 2  ? 4 : 1));
    ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
    // yes, one of these falls over the edge and doesn't get displayed, but that is ok
  }

}
