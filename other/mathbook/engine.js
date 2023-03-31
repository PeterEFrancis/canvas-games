
"use strict";

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const S = canvas.width;
const R = 20;

var n = 6;

var hover_loc = null;

var connections = new Set();

var clicked_person = null;

function change_n(num) {
  n = num;
  clear_board();
  update_display();
}


function get_loc(e) {
  let rect = canvas.getBoundingClientRect();
  let user_x = (e.clientX - rect.left) * (canvas.width / canvas.clientWidth);
  let user_y = (e.clientY - rect.top) * (canvas.height / canvas.clientHeight);
  return [user_x, user_y];
}


function dist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function get_person(loc) {
  for (let i = 0; i < n; i++) {
    if (dist(get_coords(i), loc) <= R + 10) {
      return i;
    }
  }
  return null;
}




function draw_circle(center, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(...center, radius, 0, 2 * Math.PI);
  ctx.fill();

}


canvas.addEventListener('mousemove', function(e) {
  hover_loc = get_loc(e);
  update_display();
});

canvas.addEventListener('mouseout', function(e) {
  hover_loc = null;
  update_display();
});

canvas.addEventListener('click', function(e) {
  let person = get_person(hover_loc);
  if (person == null) {
    clicked_person = null;
  } else if (clicked_person == null) {
    clicked_person = person;
  } else if (person != clicked_person) {
    let str = JSON.stringify([clicked_person, person].sort());
    if (connections.has(str)) {
      connections.delete(str);
    } else {
      connections.add(str);
    }
    clicked_person = null;
  }
  update_display();
});


function clear_board() {
  connections = [];
  hover_loc = null;
  connections = new Set();
  clicked_person = null;
  update_display();
}


function get_coords(i) {
  return [
    (S / 2) + (S * 3 / 8) * Math.cos(2 * Math.PI * i / n),
    (S / 2) - (S * 3 / 8) * Math.sin(2 * Math.PI * i / n) + 30
  ];
}




function update_display() {
  // clear the display
  ctx.clearRect(0, 0, S, S);

  // hover person
  if (hover_loc != null) {
    let person = get_person(hover_loc);
    if (person != null) {
      draw_circle(get_coords(person), R + 10, "green");
    }
  }

  // hover line
  if (hover_loc != null && clicked_person != null) {
    ctx.beginPath();
    ctx.moveTo(...get_coords(clicked_person));
    ctx.lineTo(...hover_loc);
    ctx.stroke();
  }

  // draw connections
  for (let conn of connections) {
    let rconn = JSON.parse(conn);
    ctx.beginPath();
    ctx.moveTo(...get_coords(rconn[0]));
    ctx.lineTo(...get_coords(rconn[1]));
    ctx.stroke();
  }

  // draw people
  for (let i = 0; i < n; i++) {
    let coords = get_coords(i);
    draw_circle(coords, R, "blue");
    ctx.font = "25px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(i + 1, coords[0], coords[1] + 8);
  }

  // eventually complete
  let t = 200;
  let text;
  if (eventually_complete(connections)) {
    ctx.fillStyle = "green";
    text = "Eventually Complete";
  } else {
    ctx.fillStyle = "red";
    text = "Not Eventually Complete";
  }
  ctx.fillRect(0, 0, S, 50);
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(text, S / 2, 35);



}




function factorial(a) {
  return a <= 1 ? 1 : a * factorial(a - 1);
}

function choose(a, b) {
  return factorial(a) / factorial(b) / factorial(a - b);
}




function can_connect(conn_arr, a, b) {
  let count = 0;
  for (let i = 0; i < n; i++) {
    if ((conn_arr[i][a] + conn_arr[a][i] > 1) && (conn_arr[i][b] + conn_arr[b][i] > 1)) {
      count++;
      if (count == 2) {
        return true;
      }
    }
  }
  return false;
}


function zeros(m) {
  let z = [];
  for (let i = 0; i < m; i++) {
    z.push(0);
  }
  return z;
}

function eventually_complete(conns) {

  let conn_arr = zeros(n).map(x => zeros(n));

  for (let conn of conns) {
    let rconn = JSON.parse(conn);
    conn_arr[rconn[0]][rconn[1]] = 1;
    conn_arr[rconn[1]][rconn[0]] = 1;
  }

  let clean_trials = 0;

  while (clean_trials < 2) {
    let clean_trial = true
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < a; b++) {
        if (can_connect(conn_arr, a, b) && conn_arr[b][a] === 0) {
          conn_arr[b][a] = 1;
          conn_arr[a][b] = 1;
          clean_trial = false;
        }
      }
    }
    if (clean_trial) {
      clean_trials++;
    }
  }
  return conn_arr.map(x => x.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0) == 2 * choose(n, 2);

}
