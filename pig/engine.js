
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


var scores = [0,0];
var turn_totals = [0,0];

var current_player;

var title_img;
var animal_img;
var hold_img;
var roll_img;


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

  reset_game();

}

function is_game_over() {
  return (scores[USER] + turn_totals[USER] >= 100 || scores[COMPUTER] + turn_totals[COMPUTER] >= 100);
}

function set_state() {
  set_user_score();
  set_computer_score();
  set_turn_totals();

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


}

function set_user_score() {

  var score = Math.min(GOAL, scores[USER]);
  var turn =  Math.max(Math.min(GOAL - score, turn_totals[USER]), 0);

  ctx.fillStyle = "black";
  ctx.font = "40px monospace";
  ctx.clearRect(SCORE_LEFT + SCORE_WIDTH + 100, USER_SCORE_TOP, 80, 30);
  ctx.fillText(scores[USER], SCORE_LEFT + SCORE_WIDTH + 100, USER_SCORE_TOP + 27.5);

  ctx.clearRect(SCORE_LEFT + 80, USER_SCORE_TOP, SCORE_WIDTH, 30);
  ctx.fillStyle = "blue";
  ctx.fillRect(SCORE_LEFT + 80, USER_SCORE_TOP, SCORE_WIDTH * (score / GOAL), 30);
  ctx.fillStyle = "lightblue";
  ctx.fillRect(SCORE_LEFT + 80 + SCORE_WIDTH * (score / GOAL), USER_SCORE_TOP, SCORE_WIDTH * (turn / GOAL), 30);

  ctx.rect(SCORE_LEFT + 80, USER_SCORE_TOP, SCORE_WIDTH, 30);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();

}

function set_computer_score() {
  var score = Math.min(GOAL, scores[COMPUTER]);
  var turn = Math.max(Math.min(GOAL - score, turn_totals[COMPUTER]), 0);

  ctx.fillStyle = "black";
  ctx.font = "40px monospace";
  ctx.clearRect(SCORE_LEFT + SCORE_WIDTH + 100, COMPUTER_SCORE_TOP, 80, 30);
  ctx.fillText(scores[COMPUTER], SCORE_LEFT + SCORE_WIDTH + 100, COMPUTER_SCORE_TOP + 27.5);

  ctx.clearRect(SCORE_LEFT + 80, COMPUTER_SCORE_TOP, SCORE_WIDTH, 30);
  ctx.fillStyle = "blue";
  ctx.fillRect(SCORE_LEFT + 80, COMPUTER_SCORE_TOP, SCORE_WIDTH * (score / GOAL), 30);
  ctx.fillStyle = "lightblue";
  ctx.fillRect(SCORE_LEFT + 80 + SCORE_WIDTH * (score / GOAL), COMPUTER_SCORE_TOP, SCORE_WIDTH * (turn / GOAL), 30);

  ctx.rect(SCORE_LEFT + 80, COMPUTER_SCORE_TOP, SCORE_WIDTH, 30);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
  ctx.stroke();

}

function set_turn_totals() {
  ctx.fillStyle = "black";
  ctx.font = "40px monospace";
  ctx.clearRect(350, 255, 90, 40);
  ctx.fillText(turn_totals[current_player], 360, 285);
}

function reset_game() {

  scores = [0,0];
  turn_totals = [0,0];
  current_player = USER;

  set_state();

}

function roll() {
  var num = Math.floor((Math.random() * 6) + 1);
  var die_img = new Image();
  die_img.src = "img/" + num + ".jpg";
  die_img.onload = function() {
    ctx.drawImage(die_img, WIDTH - die_img.width - 155, HEIGHT - die_img.height - 60, 80, 80);
  }
  console.log(current_player + " rolled a " + num + " with a TT " + turn_totals[current_player]);

  if (num == 1) {
    turn_totals[current_player] = 0;
    switch_players();
  } else {
    turn_totals[current_player] += num;
  }

  if (is_game_over()) {
    hold();
  }

  set_state();

}

function hold() {

  scores[current_player] += turn_totals[current_player];
  turn_totals[current_player] = 0;

  console.log(current_player + " holds");

  if (!is_game_over()) {
    switch_players();
  }

  set_state();

}

function switch_players() {
  current_player = USER + COMPUTER - current_player;

  if (current_player == COMPUTER) {

    computer_play();
  }
}

function register_click() {
  if (current_player == USER) {
    var rect = canvas.getBoundingClientRect();
    var user_x = event.clientX - rect.left;
    var user_y = event.clientY - rect.top;

    if (current_player == USER && scores[USER] < 100 && scores[COMPUTER] < 100) {
      if (user_x >= WIDTH - roll_img.width - 300 && user_x <= WIDTH - 300 && user_y > HEIGHT - roll_img.height - 15 && user_y < user_y < HEIGHT - 15) {
        roll();
      }

      if (user_x >= WIDTH - hold_img.width - 30 && user_x <= WIDTH - 30 && user_y > HEIGHT - hold_img.height - 15 && user_y < user_y < HEIGHT - 15) {
        hold();
      }
    }
  }
}

function computer_play() {
  while (scores[COMPUTER] + turn_totals[COMPUTER] < GOAL && current_player == COMPUTER) {
    if (scores[USER] > 71 || scores[COMPUTER] > 71 || turn_totals[COMPUTER] < 21 + Math.round((scores[USER] - scores[COMPUTER]) / 8)) {
      roll();
    } else {
      hold();
    }
  }
}






// setInterval(function () {if (!won) {update_board()}}, 10);
