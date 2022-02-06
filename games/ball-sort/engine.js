
"use strict";

// some of the maze generation code adapted from Todd Neller

const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const COLORS = ["red", "yellow", "blue", "green", "purple", "orange", "grey", "pink", "white", "teal", "violet", "lawngreen", "cyan", "coral", "brown", "saddlebrown"];


var num_colors;
var num_balls;
var tubes;

let rows;
let cols;

let TUBE_WIDTH;
let H_SPACING;
let TUBE_HEIGHT;
let V_SPACING;
let BALL_RADIUS;


var clicked = null;

var stack = [];

var random = Math.random;

// function set_seed(a) {
//   random = function() {
//     a |= 0;
//     a = a + 0x6D2B79F5 | 0;
//     let t = Math.imul(a ^ a >>> 15, 1 | a);
//     t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
//     return ((t ^ t >>> 14) >>> 0) / 4294967296;
//   }
// }
// set_seed(Math.random());


function random_choice(arr) {
  return arr[Math.floor(arr.length * random())];
}

function random_choice_prob(arr) {
  let r = random();
  let s = arr.map(x => x[1]).reduce((x, y) => x + y);
  let prob = 0;
  for (let i = 0; i < arr.length; i++) {
    prob += arr[i][1];
    if (r <= prob / s) {
      return arr[i][0];
    }
  }
  return arr[arr.length - 1][0];
}

function get_top(arr) {
  return arr[arr.length - 1];
}


function is_scrambled(tubes) {
  let num_empty = 0;
  for (let i = 0; i < tubes.length; i++) {
    if (tubes[i].length === 0) {
      num_empty++;
      if (num_empty == 2) {
        return tubes[tubes.length - 1].length != 0 || tubes[tubes.length - 2].length != 0;
      }
    }
  }
  return false;
}

function num_top_sim(tube) {
  let num = 0;
  for (let i = 1; i <= tube.length; i++) {
    if (tube[tube.length - i] === tube[tube.length - 1]) {
      num++;
    }
  }
  return num;
}


function rev_can_take(tube) {
  // can move a ball from a non-empty tube with a single ball or a tube with at least two colors in a row
  if (tube.length === 0) {
    return false;
  }
  if (tube.length === 1) {
    return true;
  }
  return num_top_sim(tube) >= 2;
}



function generate_helper(num_colors, num_balls) {
  let tubes = new Array(num_colors + 2);
  for (let i = 0; i < num_colors + 2; i++) {
    if (i < num_colors) {
      tubes[i] = new Array(num_balls).fill(i);
    } else {
      tubes[i] = [];
    }
  }
  let j = 0;
  let last = {take: null, put: null};

  do {
    j++;

    // prioritize tubes that have more balls of the same color
    let take_arr = tubes
      .map((x, i) => rev_can_take(x) && i != last.put ? [i, num_top_sim(x) ** 2] : -1)
      .filter(x => x != -1);
    let take = random() < 0.75 && rev_can_take(last.take) ? last.take : random_choice_prob(take_arr);

    let move_color = get_top(tubes[take]);
    // while (get_top(tubes[take]) == move_color && random() < 0.4) {
    //   console.log(take, tubes[take]);

      // can put in any tube that is not full and is different from take
      // prioritize tubes with few balls
      let put_arr = tubes
        .map((x, i) => x.length != num_balls && i != take && i != last.take ? [i, num_balls - x.length] : -1)
        .filter(x => x != -1);
      let put = random_choice_prob(put_arr);
      let poss_moves = Math.min(num_top_sim(tubes[take]), num_balls - tubes[put].length);
      for (let i = 0; i < Math.floor(random() * poss_moves) + 1; i++) {
        tubes[put].push(tubes[take].pop());
      }

    // }

    last = {take: take, put: put};
  } while (!is_scrambled(tubes) || j < 30)
  return {
    tubes: tubes,
    difficulty: j
  }
}


function generate(num_colors, num_balls) {
  let game;
  while (!game) {
    try {
      game = generate_helper(num_colors, num_balls);
    } catch (err) {}
  }
  game.tubes = game.tubes.filter(x => x.length != 0);
  game.tubes.push([], [])
  return game;
}






function start_game(n_colors, n_balls) {
  num_colors = Math.min(COLORS.length, n_colors);
  num_balls = n_balls;

  let num_balls_side = Math.sqrt((num_colors + 2) * num_balls);

  rows = Math.round(num_balls_side / num_balls);
  cols = Math.round((num_colors + 2) / rows);

  TUBE_WIDTH = canvas.height / (num_balls_side + rows + 2 + 1);
  H_SPACING = (canvas.width - TUBE_WIDTH * cols) / (cols + 1);
  TUBE_HEIGHT = TUBE_WIDTH * num_balls;
  V_SPACING = (canvas.height - (TUBE_WIDTH * (num_balls + 1)) * rows) / (rows + 1);

  BALL_RADIUS = TUBE_WIDTH / 2.1;

  tubes = generate(num_colors, num_balls).tubes;
  clicked = null;
  update_display();
}



function get_tube_click(x, y) {
  for (let i = 0; i < tubes.length; i++) {
    let r = Math.floor(i / cols);
    let c = i % cols;
    let offset = 0;
    if (r == rows - 1 && tubes.length % cols != 0) {
      offset = (cols - tubes.length % cols) * TUBE_WIDTH;
    }
    let x_min = H_SPACING + c * (H_SPACING + TUBE_WIDTH) + offset;
    let y_min = V_SPACING + TUBE_WIDTH + r * (V_SPACING + TUBE_WIDTH + TUBE_HEIGHT);
    // console.log(x_min, x_min + TUBE_WIDTH);
    if (
      x >= x_min &&
      x <= x_min + TUBE_WIDTH &&
      y >= y_min &&
      y <= y_min + TUBE_HEIGHT
    ) {
      return i;
    }
  }
  return null;
}


function on_click(tube_num) {
  if (tube_num === null) {
    return;
  }
  if (clicked === null) {
    if (tubes[tube_num].length != 0) {
      clicked = tube_num;
    }
  } else {
    if (clicked === tube_num) {
      clicked = null;
    } else if ((tubes[tube_num].length == 0 || get_top(tubes[tube_num]) === get_top(tubes[clicked])) && tubes[tube_num].length < num_balls) {
      tubes[tube_num].push(tubes[clicked].pop());
      stack.push([clicked, tube_num]);
      clicked = null;
    } else {
      clicked = tube_num;
    }
  }
  update_display();
}

function undo() {
  if (stack.length != 0) {
    let last = stack.pop();
    tubes[last[0]].push(tubes[last[1]].pop());
    clicked = null;
    update_display();
  }
}



function update_display() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw tubes
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  for (let i = 0; i < tubes.length; i++) {
    let r = Math.floor(i / cols);
    let c = i % cols;
    let offset = 0;
    if (r == rows - 1 && tubes.length % cols != 0) {
      offset = (cols - tubes.length % cols) * TUBE_WIDTH;
    }
    ctx.strokeRect(
      H_SPACING + c * (H_SPACING + TUBE_WIDTH) + offset,
      V_SPACING + TUBE_WIDTH + r * (V_SPACING + TUBE_WIDTH + TUBE_HEIGHT),
      TUBE_WIDTH,
      TUBE_HEIGHT
    );
    // ctx.fillStyle = "red";
    // ctx.font = "30px Georgia";
    // ctx.fillText(
    //   r + " " + c,
    //   H_SPACING + c * (H_SPACING + TUBE_WIDTH),
    //   V_SPACING + r * (V_SPACING + TUBE_HEIGHT)
    // );

  }

  // draw the balls
  for (let i = 0; i < tubes.length; i++) {
    for (let j = 0; j < tubes[i].length; j++) {
      let r = Math.floor(i / cols);
      let c = i % cols;
      let offset = 0;
      if (r == rows - 1 && tubes.length % cols != 0) {
        offset = (cols - tubes.length % cols) * TUBE_WIDTH;
      }
      ctx.fillStyle = COLORS[tubes[i][j]];
      ctx.lineWidth = 1;
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(
        H_SPACING + c * (H_SPACING + TUBE_WIDTH) + TUBE_WIDTH / 2 + offset,
        V_SPACING + TUBE_WIDTH + r * (V_SPACING + TUBE_WIDTH + TUBE_HEIGHT) + TUBE_WIDTH / 2 + (clicked == i && j == tubes[i].length - 1 ? - TUBE_WIDTH : TUBE_WIDTH * (num_balls - j - 1)),
        BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }

  // for (let i = 0; i < canvas.width; i += 10) {
  //   for (let j = 0; j < canvas.height; j += 10) {
  //     ctx.fillStyle = "red";
  //     ctx.font = "10px monospace";
  //     let x = get_tube_click(i, j);
  //     ctx.fillText(x != null ? x : ' ', i, j);
  //   }
  // }

}
