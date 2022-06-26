
"use strict";

function len(set) {
  return Array(...set).length;
}

function intersect(set1, set2) {
  return new Set([...set1].filter(x => set2.has(x)));
}

function copy(set) {
  return new Set(JSON.parse(JSON.stringify([...set])));
}


var WORDS, NO_REPEATS, J, guesses;
$.get("5letters.txt", function(txt) {
  WORDS = txt.split("\n");
  NO_REPEATS = new Set([...WORDS].filter(x => len(new Set(x)) == 5));
  WORDS = new Set(WORDS);

  J = new Jotto();
  guesses = ['soter'];

  // var D = {};
  // for (let word of WORDS) {
  //   console.log(word);
  //   D[word] = [];
  //   for (let f = 0; f < 6; f++) {
  //     D[word][f] = _match(NO_REPEATS, word, f);
  //   }
  // }

});



function compare(word, guess) {
  return len(intersect(new Set(word), new Set(guess)));
}

function _match(bank, guess, f) {
  return new Set([...bank].filter(x => compare(x, guess) == f));
}

// function match(bank, guess, f) {
//   return intersect(D[guess][f], bank);
// }

function count(bank, guess, f) {
  return len(_match(bank, guess, f));
}

function get_expected_information(bank, guess) {
  let ret = 0
  for (let f = 0; f < 6; f++) {
    let prob = count(bank, guess, f) / len(bank);
    ret += prob * (prob == 0 ? 0 : Math.log(1 / prob) / Math.log(2));
  }
  return ret
}



const first_few_guesses = [
  // first guess
  'soter',
  // second guess
  ['glump', 'agnel', 'daler', 'litas', 'manse', 'store'],
  // third guess
  [
    ['bandy', 'bauch', 'linga', 'primy', 'hogan'],
    ['tchwi', 'march', 'tarin', 'groin', 'piend', 'angel'],
    ['muong', 'sputa', 'piles', 'bloat', 'gulpy', 'alder'],
    ['mungy', 'unbet', 'acerb', 'poral', 'aloed'],
    [null, 'upleg', 'mowra', 'telyn'],
  ]
]





class Jotto {
  constructor() {
    this.possible = copy(NO_REPEATS);
    this.logged = [];
  }

  log(word, f) {
    this.logged.push([word, f]);
    this.possible = _match(this.possible, word, f);
    if (this.possible.has(word)) {
      this.possible.delete(word)
    }
  }

  get_guess(self) {
    let guess = '';

    // first few
    if (this.logged.length < 3) {
      let path = first_few_guesses[this.logged.length];
      for (let l = 0; l < this.logged.length; l++) {
        path = path[this.logged[l][1]];
      }
      return path;
    }


    // only one left
    if (len(this.possible) == 1) {
      return [...this.possible][0];
    }

    let maximum = 0;
    for (let word of WORDS) {
      // console.log(word);
      let info = get_expected_information(this.possible, word);
      if (info > maximum) {
        guess = word;
        maximum = info;
      }
    }
    // all remaining words are permutations
    if (guess === '') {
      return [...this.possible][0];
    }
    return guess;
  }

}







function validate(input) {
  if (!['0', '1', '2', '3', '4', '5'].includes(input.value)) {
    input.value = '';
  }
}



function enter() {

  let f = Number(document.getElementById('f').value);
  J.log(guesses[guesses.length - 1], f);
  document.getElementById('input-' + guesses.length).innerHTML = f;

  console.log(J.get_guess())
  guesses.push(J.get_guess());

  let rows = document.getElementById('rows');
  let new_row = document.createElement('tr');
  let guess_box = document.createElement('td');
  guess_box.innerHTML = guesses[guesses.length - 1];
  let input_box = document.createElement('td');
  input_box.setAttribute('id', 'input-' + guesses.length);
  let group = document.createElement('div');
  group.classList.add('input-group');
  let input = document.createElement('input');
  input.setAttribute('id', 'f');
  input.setAttribute('type', 'number');
  input.classList.add('form-control');
  input.setAttribute('min', '0');
  input.setAttribute('max', '5');
  const t = input;
  input.oninput = function() {
    validate(t);
  }
  let buttons = document.createElement('span');
  buttons.classList.add('input-group-btn');
  let enter_button = document.createElement('button');
  enter_button.setAttribute('type', 'button');
  enter_button.classList.add('btn', 'btn-primary');
  enter_button.onclick = enter;
  enter_button.innerHTML = 'Enter';
  // let correct_button = document.createElement('button');
  // correct_button.setAttribute('type', 'button');
  // correct_button.classList.add('btn', 'btn-success');
  // correct_button.onclick = correct;
  // correct_button.innerHTML = 'Correct';

  rows.appendChild(new_row);
  new_row.appendChild(guess_box);
  new_row.appendChild(input_box);
  input_box.appendChild(group);
  group.appendChild(input);
  group.appendChild(buttons);
  buttons.appendChild(enter_button);
  // buttons.appendChild(correct_button);


}




// function correct() {
//
// }
