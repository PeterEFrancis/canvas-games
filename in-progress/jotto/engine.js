
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
    [null, 'upleg', 'mowra', 'telyn', null, null],
    [null, null, null, null, null, null]
  ],
  // fourth guess
  [
    [
      ['whick', 'kafiz', 'hacky', 'cabin', 'bruin', null],
      ['undog', 'valid', 'milch', 'milch', 'bruin', null],
      [null, 'micht', 'undim', 'unbog', 'nummi', 'liang'],
      ['difda', 'bingy', 'aumil', 'glyph', 'imply', null],
      ['delay', 'amber', 'mulga', null, null, null],
      [null, null, null, null, null, null]
    ],
    [
      ['bosky', 'ruvid', 'tumid', 'butic', 'duchy', 'witch'],
      ['spiny', 'dyaus', 'rabid', 'stchi', 'swimy', null],
      ['dodgy', 'olcha', 'mendi', 'light', 'breck', null],
      ['clomb', 'gumly', 'lived', 'omlah', 'amber', null],
      [null, 'amber', 'gucki', 'grift', null, null],
      [null, null, null, null, null, 'lagen']
    ],
    [
      ['chevy', 'quint', 'scion', 'timon', 'notum', null],
      ['birch', 'thief', 'octan', 'gansy', 'sagum', null],
      ['gaunt', 'boden', 'shrap', 'shrap', 'gamin', 'slipe'],
      ['tchwi', 'parch', 'spelk', 'bourd', 'telyn', null],
      ['finch', 'barny', 'duchy', null, null, null],
      [null, null, null, null, null, null]
    ],
    [
      ['whick', 'humid', 'bogus', null, null, null],
      ['glyph', 'whart', 'slurp', 'shrub', 'hogan', null],
      ['vying', 'mohel', 'toman', 'gated', 'plebs', null],
      ['mound', 'achen', 'idler', 'alter', 'trope', null],
      [null, 'amber', 'hogan', 'amber', null, null],
      [null, null, null, null, null, null]
    ],
    [
      [null, null, null, null, null, null],
      ['duchy', 'chevy', 'trope', null, null, null],
      [null, 'lochy', 'scolb', 'uniat', null, null],
      [null, 'adnex', 'bruin', 'amber', null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ],
    [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ]
  ],
  // fifth guess
  [
    [
      [
        [null, null, null, null, null, null],
        [null, 'winch', 'fouth', 'adnex', 'hogan', null],
        [null, 'adnex', 'jinks', 'optic', 'hogan', 'chyak'],
        [null, 'dwyka', 'drink', 'habit', 'danic', null],
        [null, 'campo', 'nydia', 'bandi', null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['kylix', 'krina', 'delay', 'dying', null, null],
        ['funky', 'funis', 'wandy', 'winly', 'duchy', null],
        ['quaky', 'quint', 'humid', 'khami', 'adnex', null],
        ['adnex', 'cajun', 'hindu', 'aglow', 'amber', null],
        [null, 'alway', 'adnex', 'cuban', null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        ['alway', 'campo', 'mangy', 'hogan', 'chimu', null],
        ['hogan', 'flamb', 'fauld', 'canun', 'hogan', null],
        ['ephod', 'pleny', 'unlid', 'mound', 'bugan', null],
        [null, 'whisk', 'plank', 'bully', null, null],
        [null, null, null, null, null, 'align'],
      ],
      [
        ['adnex', 'amber', 'adnex', null, null, null],
        ['optic', 'plunk', 'amend', 'krina', null, null],
        [null, 'adnex', 'amber', 'amber', 'mucor', null],
        [null, 'amber', 'amber', 'amber', 'amber', null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, 'pilum', 'plumy', null, null, null],
        ['delay', 'gumly', 'ampul', null, null, null],
        [null, null, null, null, null, 'algum'],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ]
    ],
    [
      [
        ['frump', 'adnex', 'broad', 'amber', 'busky', null],
        ['amber', 'hasky', 'pisum', 'murky', 'amber', null],
        ['hogan', 'swimy', 'truck', 'campo', 'krina', null],
        [null, 'campo', 'flock', 'maugh', 'amber', 'cubit'],
        [null, 'whipt', 'amber', 'adnex', null, null],
        [null, null, null, null, null, 'wicht'],
      ],
      [
        ['world', 'tubig', 'skulp', 'basil', 'south', 'snipy'],
        ['block', 'bride', 'mound', 'broad', 'padus', null],
        ['pheny', 'kusha', 'apism', 'ditch', 'piend', 'barid'],
        ['bardy', 'bhima', 'caird', 'temin', 'trope', null],
        ['bruin', 'hogan', 'south', null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['cumbu', 'pocky', 'fugue', 'duchy', 'godly', null],
        ['wauns', 'beday', 'caped', 'loamy', 'maugh', 'chola'],
        ['pylar', 'islay', 'sluig', 'niche', 'amber', null],
        ['gumby', 'medio', 'lurid', 'aldus', 'amber', null],
        ['fouth', 'fluer', 'campo', null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, 'ephod', 'chomp', 'amber', null, null],
        ['duchy', 'valid', 'linus', 'wedgy', 'delay', null],
        ['fouth', 'nopal', 'amine', 'glump', 'hedge', null],
        ['cobby', 'trady', 'caird', 'hogan', null, null],
        ['login', 'gonia', 'grain', null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, 'hogan', 'delay', 'campo', null, null],
        ['amber', 'cline', 'adnex', null, null, null],
        ['adnex', 'elian', 'amber', null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, 'angle'],
      ]
    ],
    [
      [
        ['flick', 'whisk', 'hogan', 'scyth', null, null],
        ['whoop', 'whisk', 'cushy', 'gucki', 'quits', null],
        [null, 'spumy', 'cushy', 'focus', 'campo', 'oscin'],
        [null, 'amber', 'campo', 'punct', 'hogan', 'minot'],
        [null, null, null, null, null, 'montu'],
        [null, null, null, null, null, null],
      ],
      [
        ['ovary', 'movie', 'cronk', 'wring', 'amber', null],
        ['mucor', 'cogue', 'mines', 'wench', 'cline', null],
        ['brugh', 'piety', 'trunk', 'shona', 'tangy', 'acton'],
        ['break', 'copra', 'tawie', 'cutin', 'hogan', null],
        [null, null, 'smaik', 'bonny', 'amber', null],
        [null, null, null, null, null, null],
      ],
      [
        ['duchy', 'jacob', 'yacht', 'mukti', 'hogan', null],
        ['shawm', 'tlaco', 'teman', 'caxon', 'yanan', 'boned'],
        ['gondi', 'bruin', 'aulos', 'sheng', 'micht', 'sharp'],
        ['hogan', 'epulo', 'prune', 'cakey', 'adnex', null],
        ['amber', 'duchy', 'campo', null, null, null],
        [null, null, null, null, null, 'spile'],
      ],
      [
        ['palus', 'comfy', 'duchy', null, null, null],
        ['delay', 'gurly', 'guran', 'gucki', 'trope', null],
        ['ichor', 'beamy', 'blurb', 'civil', 'trope', null],
        ['foppy', 'kohen', 'campo', 'krina', 'abord', null],
        [null, 'bolar', 'dotal', 'table', null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['jemez', 'krina', null, null, null, null],
        [null, 'canso', 'levis', 'plebs', null, null],
        ['hogan', 'delay', 'delay', null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ]
    ],
    [
      [
        ['vapid', 'caped', 'whoop', null, null, null],
        ['knowe', 'plomb', 'amhar', null, null, null],
        [null, 'moner', 'amber', 'rogue', null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['adnex', 'campo', 'hogan', null, null, null],
        ['optic', 'glime', 'fotch', 'fotch', 'whort', null],
        ['mangy', 'canso', 'utchy', 'hogan', 'super', null],
        ['duchy', 'gouda', 'plebs', 'adnex', 'suber', null],
        ['rebut', 'south', 'outen', null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['duchy', 'bruin', 'hogan', null, null, null],
        ['delay', 'spewy', 'temin', 'talky', 'timid', null],
        ['finch', 'tried', 'tempi', 'outed', 'adnex', null],
        [null, 'campo', 'shank', 'month', 'adnex', null],
        [null, 'caret', 'amber', 'barse', null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['boxty', 'adnex', null, null, null, null],
        ['drink', 'noria', 'mangy', 'adnex', null, null],
        ['amber', 'cymar', 'adnex', 'trope', 'tiler', null],
        [null, null, 'amber', 'krina', 'amber', 'alert'],
        [null, null, 'solar', 'rotal', null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, 'slirt', 'astir', null, null, null],
        ['slite', 'islot', 'staio', null, null, null],
        [null, 'stola', 'least', null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ]
    ],
    [
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        ['krina', 'islay', null, null, null, null],
        ['hogan', 'adzer', 'duchy', null, null, null],
        [null, null, null, null, 'hogan', 'poter'],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        ['adnex', 'bruin', 'campo', null, null, null],
        [null, 'adnex', 'pindy', 'amber', null, null],
        ['serow', 'amber', 'amber', null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, 'sermo', 'arose', null, null, null],
        ['adnex', 'stare', 'noser', null, null, null],
        [null, 'steno', 'stern', null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ]
    ],
    [
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ],
      [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
      ]
    ]
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
    if (this.logged.length < first_few_guesses.length) {
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

  guesses.push(J.get_guess() || '-----');

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


  rows.appendChild(new_row);
  new_row.appendChild(guess_box);
  new_row.appendChild(input_box);
  input_box.appendChild(group);
  group.appendChild(input);
  group.appendChild(buttons);
  buttons.appendChild(enter_button);
}
