
"use strict";

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

var n = 6;

var hover_loc = null;

var clicked = [];



function is_clicked(sq) {
  return clicked.map(x => JSON.stringify(x)).indexOf(JSON.stringify(sq));
}


function interpolate(A, B, i) {
  return [
    (i / n) * A[0] + ((n - i) / n) * B[0],
    (i / n) * A[1] + ((n - i) / n) * B[1]
  ];
}

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


function get_square(loc) {

  let x = loc[0];
  let y = loc[1];

  // check if on cube
  if (
    y < (H / 4) - (H / (2 * W)) * x ||
    y < (H / (2 * W)) * (x - (W / 2)) ||
    y > (H * 3 / 4) + (H / (2 * W)) * x ||
    y > H - (H / (2 * W)) * (x - (W / 2))
  ) {
    return null;
  }

  let x2, y2, face;

  if (y < (H / 4) + (H / (2 * W)) * x && y < (H / 2) - (H / (2 * W)) * (x - (W / 2))) {
    face = "U";
    x2 = (W / 2) * (x / W + (y - H / 4) * 2 / H);
    y2 = (H / 2) * (x / W - (y - H / 4) * 2 / H);
  } else if (x < W / 2) {
    face = "L";
    x2 = x;
    y2 = H * 3 / 4 - y + (H / (2 * W)) * x;
  } else {
    face = "R";
    x2 = x - (W / 2);
    y2 = H - (y + (H / (2 * W)) * x2);
  }

  let u = Math.floor(n * x2 / (W / 2));
  let v = Math.floor(n * y2 / (H / 2));

  return [face, [u, v]]
}




function draw_square(face, coord, color) {
  let a = W / n;
  let b = H / (2 * n);

  ctx.fillStyle = color;
  ctx.beginPath();
  let x, y;
  if (face == 'U') {
    x = (W / 2) * coord[0] / n + (W / 2) * coord[1] / n;
    y = (H / 4) + (H / 4) * (coord[0] - coord[1]) / n;
    ctx.moveTo(x, y);
    ctx.lineTo(x + a / 2, y + b / 2);
    ctx.lineTo(x + a, y);
    ctx.lineTo(x + a / 2, y - b / 2);
  } else if (face == 'L') {
    x = (W / 2) * coord[0] / n;
    y = (H * 3 / 4) + (H / 4) * (coord[0] / n) - (H / 2) * coord[1] / n;
    ctx.moveTo(x, y);
    ctx.lineTo(x + a / 2, y + b / 2);
    ctx.lineTo(x + a / 2, y - b / 2);
    ctx.lineTo(x, y - b);
  } else if (face == 'R') {
    x = (W / 2) + (W / 2) * (coord[0] / n);
    y = H - (H / 4) * (coord[0] / n) - (H / 2) * (coord[1] / n);
    ctx.moveTo(x, y);
    ctx.lineTo(x + a / 2, y - b / 2);
    ctx.lineTo(x + a / 2, y - b * 3 / 2);
    ctx.lineTo(x, y - b);
  }

  ctx.closePath();
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
  let sq = get_square(get_loc(e));
  if (sq != null) {
    let ic = is_clicked(sq);
    if (ic >= 0) {
      clicked = clicked.slice(0, ic).concat(clicked.slice(ic + 1));
    } else {
      clicked.push(sq);
    }
  }
  update_display();
});


function clear_board() {
  clicked = [];
  // [["U",[1,1]],["U",[3,3]],["R",[0,0]],["R",[2,2]],["U",[5,5]],["R",[4,4]],["L",[0,5]],["L",[2,3]],["L",[4,1]]];
  update_display();

}



function update_display() {
  // clear the display
  ctx.clearRect(0, 0, W, H);

  // draw cube
  ctx.fillStyle = "lightgrey";
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(0, H / 4);
  ctx.lineTo(0, H * 3 / 4);
  ctx.lineTo(W / 2, H);
  ctx.lineTo(W, H  * 3 / 4);
  ctx.lineTo(W, H / 4);
  ctx.closePath();
  ctx.fill()




  // draw clicked_squares
  for (let i = 0; i < clicked.length; i++) {
    draw_square(...clicked[i], "blue");
  }


  // draw hover square
  if (hover_loc != null) {
    let sq = get_square(hover_loc);
    if (sq != null) {
      draw_square(...sq, is_clicked(sq) >= 0 ? "red" : "green");
    }
  }



  // draw bold lines
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, H / 4);
  ctx.lineTo(W / 2, H  / 2);
  ctx.moveTo(W / 2, H);
  ctx.lineTo(W / 2, H  / 2);
  ctx.moveTo(W, H / 4);
  ctx.lineTo(W / 2, H  / 2);
  ctx.stroke();

  // darw grid lines
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    // L - R
    ctx.moveTo(...interpolate([0, H / 4], [0, H * 3 / 4], i));
    ctx.lineTo(...interpolate([W / 2, H / 2],[W / 2, H], i));
    ctx.lineTo(...interpolate([W, H / 4],[W, H * 3 / 4], i));
    // U - R
    ctx.moveTo(...interpolate([0, H / 4],[W / 2, 0], i));
    ctx.lineTo(...interpolate([W / 2, H / 2],[W, H / 4], i));
    ctx.lineTo(...interpolate([W / 2, H],[W, H * 3 / 4], i));
    // L - U
    ctx.moveTo(...interpolate([0, H * 3 / 4],[W / 2, H], i));
    ctx.lineTo(...interpolate([0, H / 4],[W / 2, H / 2], i));
    ctx.lineTo(...interpolate([W / 2, 0],[W, H / 4], i));
  }
  ctx.stroke();


}





function get_beam_obj(sq) {
  return {
    'L': sq[0] == 'L' ? 1 : 0,
    'U': sq[0] == 'U' ? 1 : 0,
    'R': sq[0] == 'R' ? 1 : 0,
    'D': sq[0] == 'U' ? 1 : 0,
    'S': sq[0] == 'L' ? 1 : 0,
    'P': sq[0] == 'R' ? 1 : 0
  }
}

function is_beam_covered(beam) {
  return [...new Set(Object.values(beam))].length == 1;
}


// function two_beams_touch(sq1, sq2) {
//   // same orientation
//   if (sq1[0] == sq2[0]) {
//     if (sq1[1][0] == sq2[1][0] && Math.abs(sq1[1][1] - sq2[1][1]) == 1) {
//       return true;
//     }
//     if (sq1[1][1] == sq2[1][1] && Math.abs(sq1[1][0] - sq2[1][0]) == 1) {
//       return true;
//     }
//   }
// }


// function check_board() {
//
//   /**
//   //  check that no two interirors overlap
//   //      create a list of all interal blocks that are occupied by beams
//   //      check if there are duplicates
//   **/
//
//   let internal_blocks = [];
//
//   for (let sq of clicked) {
//     if (sq[0] == 'U') {
//       for (let i = 0; i < n; i++) {
//         internal_blocks.push([n - sq[1][0] - 1, sq[1][1], i]);
//       }
//     } else if (sq[0] == 'L') {
//       for (let i = 0; i < n; i++) {
//         internal_blocks.push([n - sq[1][0] - 1, i, n - sq[1][1] - 1]);
//       }
//     } else if (sq[0] == 'R') {
//       for (let i = 0; i < n; i++) {
//         internal_blocks.push([i, sq[1][0], n - sq[1][1] - 1]);
//       }
//     }
//   }
//   if ([...new Set(internal_blocks.map(x => JSON.stringify(x)))].length != internal_blocks.map(x => JSON.stringify(x)).length) {
//     return false;
//   }
//
//
//
//   // check that every internal edge of a beam touches another beam or a side of the cube
//   //     create a map of beams and faces that need to be checked
//   //     for each beam face that is not yet checked
//   //         if they are touching mark both of them in the map
//
//
//   let checked = Object.fromEntries(clicked.map(sq => [JSON.stringify(sq), get_beam_obj(sq)]));
//
//   for (let a in checked) {
//     if (is_beam_covered(checked[a])) {
//       continue;
//     }
//     for (let f in checked[a]) {
//       if (checked[a][f] === 1) {
//         continue;
//       }
//       for (let b in checked) {
//         if ()
//       }
//     }
//   }
//
//
// }
