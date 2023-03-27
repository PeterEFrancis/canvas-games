
"use strict";

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const S = Math.sqrt(canvas.height ** 2 + (canvas.width / 2) ** 2);

const DIRS = [
  [1 / 2, -1 / (2 * Math.sqrt(3))],
  [-1 / 2, -1 / (2 * Math.sqrt(3))],
  [0, 1 / Math.sqrt(3)],
];


var L = 4;

var clicks = [];
var selected_triangle = null;

var hover_loc = null;

var on_board = false;




function change_L(num) {
  L = Number(num);
  clear_board();
}


function get_loc(e) {
  let rect = canvas.getBoundingClientRect();
  let user_x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  let user_y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  return [user_x, user_y];
}


function area_triangle(x1, y1, x2, y2, x3, y3) {
  return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0);
}

function is_inside(x1, y1, x2, y2, x3, y3, x, y) {
  let A = area_triangle(x1, y1, x2, y2, x3, y3);
  let A1 = area_triangle(x, y, x2, y2, x3, y3);
  let A2 = area_triangle(x1, y1, x, y, x3, y3);
  let A3 = area_triangle(x1, y1, x2, y2, x, y);
  return Math.abs(A - (A1 + A2 + A3)) < 0.00001;
}

function get_selected(loc) {
  // finds first click that contains loc
  for (let i = clicks.length - 1; i >= 0; i--) {
    if (is_inside(
      clicks[i][0] + (S / L) * (1 / 2),
      clicks[i][1] - (S / L) * (1 / (2 * Math.sqrt(3))),
      clicks[i][0] - (S / L) * (1 / 2),
      clicks[i][1] - (S / L) * (1 / (2 * Math.sqrt(3))),
      clicks[i][0],
      clicks[i][1] + (S / L) * (1 / Math.sqrt(3)),
      loc[0],
      loc[1]
    )) {
      return i;
    }
  }
  return null;
}


function point_is_inside(x, y) {
  // left side
  if (y < HEIGHT - Math.sqrt(3) * x) {
    return false;
  }
  // right side
  if (y < Math.sqrt(3) * (x - (WIDTH / 2))) {
    return false;
  }
  // bottom
  if (y > HEIGHT) {
    return false;
  }
  return true;
}

function triangle_inside_big(loc) {

  for (let i = 0; i < 3; i++) {
    let x = loc[0] + (S / L) * DIRS[i][0];
    let y = loc[1] + (S / L) * DIRS[i][1];

    if (!point_is_inside(x, y)) {
      return false;
    }
  }
  return true;
}


canvas.addEventListener('mousemove', function(e) {
  let loc = get_loc(e);

  if (point_is_inside(loc[0], loc[1])) {
    hover_loc = loc;
    on_board = triangle_inside_big(loc);
    selected_triangle = get_selected(loc);
  } else {
    hover_loc = null;
  }
  update_display();
});

canvas.addEventListener('mouseout', function(e) {
  hover_loc = null;
  update_display();
});


canvas.addEventListener('click', function(e) {
  let loc = get_loc(e);
  if (selected_triangle != null) {
    // delete triangle
    clicks = clicks.slice(0, selected_triangle).concat(clicks.slice(selected_triangle + 1));
    selected_triangle = null;
  } else if (point_is_inside(loc)) {
    // add triangle
    clicks.push(loc);
    hover_loc = null;
  }
  update_display();
});




function clear_board() {
  // make a new (blank) board array
  clicks = [];
  update_display();
}





function draw_triangle(x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x + size * (1 / 2), y - size * (1 / (2 * Math.sqrt(3))));
  ctx.lineTo(x - size * (1 / 2), y - size * (1 / (2 * Math.sqrt(3))));
  ctx.lineTo(x, y + size * (1 / Math.sqrt(3)));
  ctx.closePath();
  ctx.fill();
  return false;
}





function update_display() {
  // clear the display
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // draw the big triangle
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(0, HEIGHT);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.closePath();
  ctx.fill();

  // draw past clicks
  for (let i = 0; i < clicks.length; i++) {
    if (i === selected_triangle) {
      ctx.fillStyle = "rgb(255,0,0)";
    } else {
      ctx.fillStyle = "rgb(0,0,255)";
    }
    draw_triangle(clicks[i][0], clicks[i][1], S / L);
    ctx.stroke();
  }

  // draw hover tiangle
  ctx.fillStyle = on_board ? "rgb(0,255,0)" : "rgba(0,255,0,0.5)";
  if (hover_loc && selected_triangle === null) {
    draw_triangle(hover_loc[0], hover_loc[1], S / L);
  }

  // draw sides
  ctx.fillStyle = "#3F3F3F";
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT);
  ctx.lineTo(WIDTH / 2, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(WIDTH, HEIGHT);
  ctx.lineTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.closePath();
  ctx.fill();
}
