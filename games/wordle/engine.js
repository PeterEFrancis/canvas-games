
var random;

function set_seed(seed) {
  console.log('seed:', seed);
  random = mulberry32(seed);
}

function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

set_seed(Math.round(new Date().getTime() / 2000 ));


const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");



var FIVE_LETTER_WORDS;
$.get("5letters.txt", function(txt) {
  FIVE_LETTER_WORDS = txt.split("\n");
});



var word_id;
var curr;
var guesses;


function new_game() {
  word_id = Math.floor(random() * FIVE_LETTER_WORDS.length);
  document.getElementById('wordle').innerHTML = FIVE_LETTER_WORDS[word_id];
  document.getElementById('word_id').innerHTML = word_id;
  curr = '';
  guesses = [];
  update_display();
}


function type_letter(letter) {
  if (guesses.length != 6 && curr.length < 5)  {
    curr = curr + letter.toLowerCase();
    update_display();
  }
}

function delete_letter() {
  if (curr.length > 0) {
    curr = curr.substring(0, curr.length - 1);
    update_display();
  }
}

function enter_word() {
  if (curr.length == 5) {
    if (FIVE_LETTER_WORDS.includes(curr)) {
      guesses.push(curr);
      curr = '';
      update_display();
      if (guesses.length == 6) {
        if (guesses[5] != FIVE_LETTER_WORDS[word_id]) {
          $("#modal").modal();
        }
      }
    } else {
      alert(curr + ' is not a valid word!');
    }
  }
}





function update_display() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let grid = JSON.parse(JSON.stringify(guesses));
  if (curr.length > 0) {
    grid.push(curr);
  }

  // draw guesses
  ctx.strokeStyle = "white";
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      if (grid[i] && grid[i].length === 5 && (curr === '' || i != guesses.length)) {
        if (grid[i].includes(FIVE_LETTER_WORDS[word_id]))


        if (FIVE_LETTER_WORDS[word_id].includes(grid[i][j])) {
          let num_in_word = Math.sum(FIVE_LETTER_WORDS[word_id].map(x => x == grid[i][j] ? 1 : 0));

          if (FIVE_LETTER_WORDS[word_id][j] === grid[i][j]) {
            ctx.fillStyle = "rgb(96, 139, 85)"; // green
          } else {
            ctx.fillStyle = "rgb(177, 159, 76)"; // yellow
          }
        } else {
          ctx.fillStyle = "grey";
        }
        ctx.fillRect(55 + j * 100, 50 + i * 115, 90, 90);
      }
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "80px arial";
      if (grid[i] && grid[i].length > j) {
        ctx.fillText(grid[i][j].toUpperCase(), 100 + j * 100, 125 + i * 115);
      }
      ctx.strokeRect(55 + j * 100, 50 + i * 115, 90, 90);
    }
  }

  // update keyboard
  if (guesses.length == 0) {
    for (let i = 0; i < 26; i++) {
      document.getElementById('letter-' + String.fromCharCode(65 + i)).style.backgroundColor = 'white';
    }
  } else {
    let yellow_letters = guesses.join("").split("").filter(x => FIVE_LETTER_WORDS[word_id].includes(x));
    for (let i = 0; i < yellow_letters.length; i++) {
      document.getElementById('letter-' + yellow_letters[i].toUpperCase()).style.backgroundColor = 'rgb(177, 159, 76)';
    }
    let grey_letters = guesses.join("").split("").filter(x => !FIVE_LETTER_WORDS[word_id].includes(x));
    for (let i = 0; i < grey_letters.length; i++) {
      document.getElementById('letter-' + grey_letters[i].toUpperCase()).style.backgroundColor = 'grey';
    }
  }

}


setTimeout(function() {
  new_game()
}, 500);
