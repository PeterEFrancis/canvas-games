

//   ____                         _                     _
//  / ___|   ___    _ __    ___  | |_    __ _   _ __   | |_   ___
// | |      / _ \  | '_ \  / __| | __|  / _` | | '_ \  | __| / __|
// | |___  | (_) | | | | | \__ \ | |_  | (_| | | | | | | |_  \__ \
//  \____|  \___/  |_| |_| |___/  \__|  \__,_| |_| |_|  \__| |___/


const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const SCORE_WIDTH = 200;
const USER_SCORE_TOP = 20;
const COMPUTER_SCORE_TOP = 80;
const SCORE_LEFT = 220;

const GOAL = 100;

const USER = 0;
const COMPUTER = 1;


 //  _____   _          _       _
 // |  ___| (_)   ___  | |   __| |  ___
 // | |_    | |  / _ \ | |  / _` | / __|
 // |  _|   | | |  __/ | | | (_| | \__ \
 // |_|     |_|  \___| |_|  \__,_| |___/



var scores = [0,0];
var turn_totals = [0,0];

var current_player;

var title_img;
var animal_img;
var hold_img;
var roll_img;

var playing;

var current_die;
var moving;

var computerTurnIntervalID;



//   ____
//  / ___|   __ _   _ __ ___     ___
// | |  _   / _` | | '_ ` _ \   / _ \
// | |_| | | (_| | | | | | | | |  __/
//  \____|  \__,_| |_| |_| |_|  \___|


function update() {
    console.log("update()");

    // current player triangle
    ctx.clearRect(180, 10, 30, 150);
    ctx.lineWidth = 0;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "red";
    ctx.beginPath();

    if (current_player == USER) {
      ctx.moveTo(185,20);
      ctx.lineTo(185,40);
      ctx.lineTo(205,30);
    } else {
      ctx.fillStyle = "red";
      ctx.moveTo(185,65 + 20);
      ctx.lineTo(185,65 + 40);
      ctx.lineTo(205,65 + 30);
    }
    ctx.closePath();
    ctx.fill();



    // user score
    var u_score = Math.min(GOAL, scores[USER]);
    var u_turn =  Math.max(Math.min(GOAL - u_score, turn_totals[USER]), 0);

    ctx.fillStyle = "black";
    ctx.font = "40px monospace";
    ctx.clearRect(SCORE_LEFT + SCORE_WIDTH + 100, USER_SCORE_TOP, 80, 30);
    ctx.fillText(scores[USER], SCORE_LEFT + SCORE_WIDTH + 100, USER_SCORE_TOP + 27.5);

    ctx.clearRect(SCORE_LEFT + 80, USER_SCORE_TOP, SCORE_WIDTH, 30);
    ctx.fillStyle = "blue";
    ctx.fillRect(SCORE_LEFT + 80, USER_SCORE_TOP, SCORE_WIDTH * (u_score / GOAL), 30);
    ctx.fillStyle = "lightblue";
    ctx.fillRect(SCORE_LEFT + 80 + SCORE_WIDTH * (u_score / GOAL), USER_SCORE_TOP, SCORE_WIDTH * (u_turn / GOAL), 30);

    ctx.rect(SCORE_LEFT + 80, USER_SCORE_TOP, SCORE_WIDTH, 30);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();



    // computer score
    var c_score = Math.min(GOAL, scores[COMPUTER]);
    var c_turn = Math.max(Math.min(GOAL - c_score, turn_totals[COMPUTER]), 0);

    ctx.fillStyle = "black";
    ctx.font = "40px monospace";
    ctx.clearRect(SCORE_LEFT + SCORE_WIDTH + 100, COMPUTER_SCORE_TOP, 80, 30);
    ctx.fillText(scores[COMPUTER], SCORE_LEFT + SCORE_WIDTH + 100, COMPUTER_SCORE_TOP + 27.5);

    ctx.clearRect(SCORE_LEFT + 80, COMPUTER_SCORE_TOP, SCORE_WIDTH, 30);
    ctx.fillStyle = "blue";
    ctx.fillRect(SCORE_LEFT + 80, COMPUTER_SCORE_TOP, SCORE_WIDTH * (c_score / GOAL), 30);
    ctx.fillStyle = "lightblue";
    ctx.fillRect(SCORE_LEFT + 80 + SCORE_WIDTH * (c_score / GOAL), COMPUTER_SCORE_TOP, SCORE_WIDTH * (c_turn / GOAL), 30);

    ctx.rect(SCORE_LEFT + 80, COMPUTER_SCORE_TOP, SCORE_WIDTH, 30);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();



    // turn Total
    ctx.fillStyle = "black";
    ctx.font = "40px monospace";
    ctx.clearRect(350, 255, 90, 40);
    ctx.fillText(turn_totals[current_player], 360, 285);



    // die
    ctx.fillStyle = "black";
    ctx.font = "50px monospace";
    ctx.clearRect(WIDTH - 280, HEIGHT - 180, 120, 110);
    if (current_die != 0) {
      ctx.fillText(current_die, WIDTH - 250, 180);
    }

}
setInterval(function () {
  if (playing) {
    update()
  }
}, 10);






// function sleep(milliseconds) {
//   const date = Date.now();
//   let currentDate = null;
//   do {
//     currentDate = Date.now();
//   } while (currentDate - date < milliseconds);
// }












/**
 * place all of the static images and text
 */
function initialize() {

  title_img = new Image();
  title_img.src = "img/title.png";
  title_img.onload = function() {
      ctx.drawImage(title_img, 10, 10, title_img.width * 0.7, title_img.height * 0.7);
  }

  animal_img = new Image();
  animal_img.src = "img/animal.png";
  animal_img.onload = function() {
      ctx.drawImage(animal_img, 0, HEIGHT - animal_img.height);
  }

  hold_img = new Image();
  hold_img.src = "img/hold.jpg";
  hold_img.onload = function() {
    ctx.drawImage(hold_img, WIDTH - hold_img.width - 30, HEIGHT - hold_img.height - 15);
  }

  roll_img = new Image();
  roll_img.src = "img/roll.jpg";
  roll_img.onload = function() {
    ctx.drawImage(roll_img, WIDTH - roll_img.width - 300, HEIGHT - roll_img.height - 15);
  }

  ctx.fillStyle = "black";
  ctx.font = "20px monospace";
  ctx.fillText(" Your", SCORE_LEFT, USER_SCORE_TOP + 10);
  ctx.fillText("Score", SCORE_LEFT, USER_SCORE_TOP + 35);
  ctx.fillText("Comp.", SCORE_LEFT, COMPUTER_SCORE_TOP + 10);
  ctx.fillText("Score", SCORE_LEFT, COMPUTER_SCORE_TOP + 35);

  // ctx.fillStyle = "grey";
  // ctx.fillRect(20, 120, 100, 20);
  // ctx.fillStyle = "white";
  // ctx.font = "15px monospace";
  // ctx.fillText("Get Hint", 34, 134);

  ctx.fillStyle = "black";
  ctx.font = "15px monospace";
  ctx.fillText("Turn Total", 340, 250);

  current_player = COMPUTER; // this will be switched below

  reset_game();

}

/**
 * start game over with player switch
 */
function reset_game() {

  playing = true;
  scores = [0,0];
  turn_totals = [0,0];
  current_die = 0;

  switch_players();

}

/**
 * returns if the turn_totals + scores is at least 100 in at least one of the coordinates
 */
function is_game_over() {
  return (scores[USER] + turn_totals[USER] >= 100 || scores[COMPUTER] + turn_totals[COMPUTER] >= 100);
}

function game_over_screen() {
  update();
  playing = false;
}


/**
 * get click from display and propogate "buttons" to events
 */
function register_click() {
  if (current_player == USER && !moving) {
    var rect = canvas.getBoundingClientRect();
    var user_x = event.clientX - rect.left;
    var user_y = event.clientY - rect.top;

    if (current_player == USER && scores[USER] < 100 && scores[COMPUTER] < 100) {
      if (user_x >= WIDTH - roll_img.width - 300 && user_x <= WIDTH - 300 && user_y > HEIGHT - roll_img.height - 15 && user_y < user_y < HEIGHT - 15) {
        roll();
      }
      if (user_x >= WIDTH - hold_img.width - 30 && user_x <= WIDTH - 30 && user_y > HEIGHT - hold_img.height - 15 && user_y < user_y < HEIGHT - 15) {
        current_die = 0;
        hold();
      }
    }
  }
  else if (is_game_over()) {
    reset_game();
  }
}






function roll() {
  console.log("roll()");
  moving = true;
  var i = 0;
  var rollIntervalId = setInterval(function() {
    current_die = Math.floor((Math.random() * 6) + 1);
    if (i < 15) {
      i++;
    } else {
      clearInterval(rollIntervalId);
      if (current_die == 1) {
        turn_totals[current_player] = 0;
        console.log(current_player + " rolled a pig!");
        update();
        clearInterval(computerTurnIntervalID);
        switch_players();
      } else {
        turn_totals[current_player] += current_die;
        console.log(current_player + " rolled a " + current_die + " -> turn total of " + turn_totals[current_player]);
        if (is_game_over()) {
          hold();
        }
      }
      moving = false;
      update();
    }
  }, 50);

}



function hold() {
  console.log(current_player + " holds");

  scores[current_player] += turn_totals[current_player];
  turn_totals[current_player] = 0;

  if (is_game_over()) {
    game_over_screen();
  } else {
    switch_players();
  }

}



function switch_players() {
  console.log("switch_players()");

  current_player = USER + COMPUTER - current_player;

  if (current_player == COMPUTER) {
    computer_turn();
  }
}




/**
 * take the computer turns
 */
function computer_turn() {
  console.log("computer_turn()");

  computerTurnIntervalID = setInterval(function() {

    if (does_computer_roll()) {
      roll();
    } else {
      clearInterval(computerTurnIntervalID);
      hold();
    }

  }, 1500);

}





function does_computer_roll() {
  console.log("does_computer_roll()");

  if (scores[COMPUTER] + turn_totals[COMPUTER] >= GOAL) {
    return false;
  }
  if (scores[USER] >= 71 || scores[COMPUTER] >= 71 || turn_totals[COMPUTER] < 21 + Math.round((scores[USER] - scores[COMPUTER]) / 8)) {
    return true;
  }
  return false;
}
