
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



const SIZE = canvas.height;
const LINE_WIDTH = 2; // works best if this is even

const BLANK = 0;
const TILE = 1;



var num_squares = 4;
var square_size = SIZE / num_squares;
var board = [];
var last_three = [];

var undo_stack = [];
var redo_stack = [];

function log_move(type, data) {
  undo_stack.push([type, data]);
  document.getElementById('undo').disabled = false;
}

function undo() {
  if (undo_stack.length > 0) {
    let [type, data] = undo_stack.pop();
    redo_stack.push([type, data]);
    document.getElementById('redo').disabled = false;
    if (type == 'row') {
      make_row_move(data, 'add');
    } else if (type == 'column') {
      make_column_move(data, 'add');
    } else {
      make_tromino_move(data, 'remove');
    }
    update_display();
    if (undo_stack.length == 0) {
      document.getElementById('undo').disabled = true;
    }
  }
}
function redo() {
  if (redo_stack.length > 0) {
    let [type, data] = redo_stack.pop();
    undo_stack.push([type, data]);
    document.getElementById('undo').disabled = false;
    if (type == 'row') {
      make_row_move(data, 'remove');
    } else if (type == 'column') {
      make_column_move(data, 'remove');
    } else {
      make_tromino_move(data, 'add');
    }
    update_display();
    if (redo_stack.length == 0) {
      document.getElementById('redo').disabled = true;
    }
  }
}

function is_tile(square_id) {
  return board[square_id] == TILE;
}

function add_tile(square_id) {
  board[square_id] = TILE;
}
function remove_tile(square_id) {
  board[square_id] = BLANK;
}


function make_row_move(r, dir) {
  for (let i = 0; i < num_squares; i++) {
    if (dir == 'remove') {
      remove_tile(r * num_squares + i);
    } else {
      add_tile(r * num_squares + i);
    }
  }
}
function make_column_move(c, dir) {
  for (let i = 0; i < num_squares; i++) {
    if (dir == 'remove') {
      remove_tile(i * num_squares + c);
    } else {
      add_tile(i * num_squares + c);
    }
  }
}
function make_tromino_move(three, dir) {
  for (let i = 0; i < 3; i++) {
    if (dir == 'remove') {
      remove_tile(three[i]);
    } else {
      add_tile(three[i]);
    }
  }
}


// function make_move(type, data, dir) {
//
// }



function change_num_squares(amount) {
  if (num_squares + amount >= 3) {
    num_squares += amount;
    square_size = SIZE / num_squares;
  }
  clear_board();
  document.getElementById('minus').disabled = num_squares == 3;
  document.getElementById('plus').disabled = num_squares == 36;
}




function get_square_id(e) {
  let rect = canvas.getBoundingClientRect();
  let user_x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  let user_y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  let row = Math.floor(user_y / (SIZE / num_squares));
  let col = Math.floor(user_x / (SIZE / num_squares));
  return row * num_squares + col;
}




canvas.addEventListener('mousemove', function(e) {
  let square_id = get_square_id(e);
  // if (last_three[last_three.length - 1] != square_id) {
  if (last_three.includes(square_id)) {
    last_three = last_three.filter(x => x != square_id);
    last_three.push(square_id);
  } else {
    if (last_three.length == 3) {
      last_three = last_three.slice(1);
    }
    last_three.push(square_id);
    update_display();
  }
});

canvas.addEventListener('mouseout', function(e) {
  last_three = [];
  update_display();
});






canvas.addEventListener('click', function(e) {
  let square_id = get_square_id(e);
  let rc = get_rc();
  if (is_row(rc) && is_row_full(rc[0][0])) {
    let r = Math.floor(last_three[0] / num_squares);
    make_row_move(r, 'remove');
    log_move('row', r);
  } else if (is_column(rc) && is_column_full(rc[0][1])) {
    let c = last_three[0] % num_squares;
    make_column_move(c, 'remove');
    log_move('column', c);
  } else if (is_tromino(rc) && is_last_three_all_empty()) {
    make_tromino_move(last_three, 'add');
    log_move('tromino', JSON.parse(JSON.stringify(last_three)));
  }
  redo_stack = [];
  update_display();
});




function clear_board() {
  // make a new (blank) board array
  board = Array(num_squares ** 2).fill(BLANK);
  last_three = [];
  undo_stack = [];
  redo_Stack = [];
  update_display();
}



function get_rc() {
  return last_three.map(x => [Math.floor(x / num_squares), x % num_squares]);
}


function is_last_three_all_empty() {
  return Array(3).fill(0).map((x,i) => board[last_three[i]]).reduce((x,y) => x + y) == BLANK * 3;
}
function is_row_full(r) {
  return Array(num_squares).fill(0).map((x,i) => board[r * num_squares + i]).reduce((x,y) => x + y) == TILE * num_squares;
}
function is_column_full(c) {
  return Array(num_squares).fill(0).map((x,i) => board[i * num_squares + c]).reduce((x,y) => x + y) == TILE * num_squares;
}


function is_tromino(rc) {
  // let PERMS =  [[0,1,2], [0,2,1], [1,0,2], [1,2,0], [2,0,1], [2,1,0]];
  // for (let p of PERMS) {
  //   if (rc[p[0]][0] == rc[p[1]][0] && Math.abs(rc[p[0]][1] - rc[p[1]][1]) == 1 && Math.abs(rc[p[1]][0] - rc[p[2]][0]) == 1 && rc[p[1]][1] == rc[p[2]][1]) {
  //     return true;
  //   }
  // }
  // return false;
  let m = Math.min(...last_three);
  return last_three.includes(m + num_squares) && last_three.includes(m + num_squares + 1);
}
function is_column(rc) {
  return rc[0][1] == rc[1][1] && rc[1][1] == rc[2][1];
}
function is_row(rc) {
  return rc[0][0] == rc[1][0] && rc[1][0] == rc[2][0];
}




function update_display() {
  // clear the display
  ctx.clearRect(0, 0, SIZE, SIZE);
  for (let i = 0; i < num_squares * num_squares; i++) {
    let x = (i % num_squares) * (square_size);
    let y = Math.floor(i / num_squares) * (square_size);
    // draw icon
    if (is_tile(i)) {
      ctx.fillStyle = "blue";
      ctx.fillRect(x + square_size / 6, y + square_size / 6, square_size * (4/6), square_size * (4/6));
    }

  }

  // last three
  if (last_three.length == 3) {
    ctx.lineWidth = square_size / 20;
    let rc = get_rc();
    if (is_row(rc)) {
      if (is_row_full(rc[0][0])) {
        ctx.strokeStyle = "red";
        ctx.fillStyle = "rgba(255,0,0,0.5)";
      } else {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "transparent";
      }
      for (let i = 0; i < num_squares; i++) {
        ctx.strokeRect(i * square_size, rc[0][0] * square_size, square_size, square_size);
        ctx.fillRect(i * square_size, rc[0][0] * square_size, square_size, square_size);
      }
    } else if (is_column(rc)) {
      if (is_column_full(rc[0][1])) {
        ctx.strokeStyle = "red";
        ctx.fillStyle = "rgba(255,0,0,0.5)";
      } else {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "transparent";
      }
      for (let i = 0; i < num_squares; i++) {
        ctx.strokeRect(rc[0][1] * square_size, i * (square_size), square_size, square_size);
        ctx.fillRect(rc[0][1] * square_size, i * (square_size), square_size, square_size);
      }
    } else if (is_tromino(rc)) {
      if (is_last_three_all_empty()) {
        ctx.strokeStyle = "green";
        ctx.fillStyle = "rgba(0,255,0,0.5)";
      } else {
        ctx.strokeStyle = "black";
        ctx.fillStyle = "transparent";
      }
      for (let i = 0; i < 3; i++) {
        let x = (last_three[i] % num_squares) * (square_size);
        let y = Math.floor(last_three[i] / num_squares) * (square_size);
        ctx.strokeRect(x, y, square_size, square_size);
        ctx.fillRect(x, y, square_size, square_size);
      }
    }

  }


  // add the grid lines
  ctx.fillStyle = "black";
  for (var i = 0; i <= num_squares + 1; i++) {
    ctx.fillRect(0 - LINE_WIDTH / 2, i * square_size - LINE_WIDTH / 2 - (i == num_squares / 2  ? 2 : 0), SIZE, LINE_WIDTH);
    ctx.fillRect(i * square_size - (LINE_WIDTH / 2), 0, LINE_WIDTH, SIZE);
    // yes, one of these falls over the edge and doesn't get displayed, but that is ok
  }

}
