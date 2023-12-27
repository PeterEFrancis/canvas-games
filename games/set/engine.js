

let canvas = document.getElementById('display');
let ctx = canvas.getContext('2d');

const CARD_WIDTH = 242;
const CARD_HEIGHT = 150;
const GRID_MARGIN = 37;


// card object

//                0          1         2
// NUMBER   0:    1          2         3
// COLOR    1:   red       green      blue
// SHAPE    2:   oval     squiggle   diamond
// PATTERN  3:  filled    striped     empty


function three_good(a, b, c) {
	if ((a == b && b == c) || (a != b && a != c && b != c)) {
		return true;
	}
	return false;
}


function is_set(c1, c2, c3) {
	for (let i = 0; i < 4; i++) {
		if (!three_good(c1[i], c2[i], c3[i])) {
			return false;
		}
	}
	return true;
}


function randomize(list) {
	let ret = [];
	while (list.length > 0) {
		let i = Math.floor(Math.random() * list.length);
		ret.push(list.splice(i, 1)[0]);
	}
	return ret;
}


function generate_all_cards() {
	let ret = [];
	let last = [0, 0, 0, 0];
	while (true) {
		ret.push(JSON.parse(JSON.stringify(last)));
		last[0] += 1;
		for (let i = 0; i < last.length; i++) {
			if (last[i] == 3) {
				if (i == last.length - 1) {
					return ret;
				}
				last[i] = 0;
				last[i + 1] += 1;
			}
		}
	}
}


const ALL_CARDS = JSON.stringify(generate_all_cards());


function get_random_deck() {
	return randomize(JSON.parse(ALL_CARDS));
}




// drawing

let p_r = document.getElementById('redstripe');
let p_g = document.getElementById('greenstripe')
let p_b = document.getElementById('bluestripe')


const COLORS = ['red', 'green', 'blue'];
const STRIPES = [ctx.createPattern(p_r, "repeat"), ctx.createPattern(p_g, "repeat"), ctx.createPattern(p_b, "repeat")] ;
const SHAPES = [draw_oval, draw_squiggle, draw_diamond];


function draw_card(ctx, x, y, cn) {
	let card = cards[cn];
	ctx.fillStyle =  clicked.has(cn) ? "#f9fc97" : found.has(cn) ? "#a872ff" : "white";
	roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 7);	
	ctx.fill();
	ctx.strokeStyle = COLORS[card[1]];
	ctx.lineWidth = 4;

	if (card[3] == 1) {
		ctx.fillStyle = STRIPES[card[1]];
	} else if (card[3] == 2) {
		ctx.fillStyle = "white";
	} else {
		ctx.fillStyle = COLORS[card[1]];
	}

	let offset = CARD_WIDTH / 2 - card[0] * 35;

	for (let i = 0; i < card[0] + 1; i++) {
		SHAPES[card[2]](ctx, x + offset + 70 * i, y + 25, card[3]);		
		ctx.fill();
		ctx.stroke();
	}
	// ctx.fillStyle = 'black';
	// ctx.font = "18pt monospace";
	// ctx.fillText(text + ': ' + JSON.stringify(card), x + 30, y + 22);
}


function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}


function draw_diamond(ctx, x, y) {
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + 25, y + 50);
	ctx.lineTo(x, y + 100);
	ctx.lineTo(x - 25, y + 50);
	ctx.closePath();
}

function draw_oval(ctx, x, y) {
	ctx.beginPath();
	ctx.arc(x, y + 20, 20, Math.PI, 2*Math.PI);
	ctx.lineTo(x + 20, y + 80);
	ctx.arc(x, y + 80, 20, 0, Math.PI);
	ctx.closePath();
}


function draw_squiggle(ctx, x, y) {
	let points1 = get_points(bezier([[70, 0], [100,0], [0, 50], [50, 30], [100, 50], [100, 100], [30, 100]])).map(z=>[z[0] + x - 50, z[1] + y]);
	let points2 = get_points(bezier([[70, 0], [0,0], [0, 50], [50, 70], [100, 50], [0, 100], [30, 100]])).map(z=>[z[0] + x - 50, z[1] + y]);
	ctx.beginPath();
	ctx.moveTo(x + 20, y);
	for (let i = 0; i < points1.length; i++) {
		ctx.lineTo(points1[i][0], points1[i][1]);
	}
	for (let i = points2.length - 1; i >= 0; i--) {
		ctx.lineTo(points2[i][0], points2[i][1]);
	}
	ctx.closePath();
}


function factorial(m) {
	if (m == 0) {
		return 1;
	}
	return m * factorial(m - 1);
}

function choose(n, k) {
	return factorial(n) / factorial(k) / factorial(n - k);
}

function bezier(points) {

	const n = points.length - 1;

	return function (t) {
		let sum = [0, 0];
		for (let i = 0; i <= n; i++) {
			let fact = choose(n, i) * ((1 - t) ** (n - i)) * (t ** i);
			sum[0] += fact * points[i][0];
			sum[1] += fact * points[i][1];
		}
		return sum;
	}
}

function get_points(path) {
	let num_steps = 100;
	let ret = [];
	for (let i = 0; i < num_steps; i++) {
		ret.push(path(i / num_steps))
	}
	ret.push(path(1));
	return ret;
}




// GAME


var deck;
var cards;
var clicked;
var found;


function new_game() {
	clicked = new Set();
	found = new Set();
	deck = get_random_deck();
	cards = [];
	for (let i = 0; i < 12; i++) {
		cards.push(deck.pop());
	}
	update();
}


function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let r = 0; r < cards.length / 3; r++) {
		for (let c = 0; c < 3; c++) {
			let cn = 3 * r + c;
			if (cards[cn]) {
				draw_card(
					ctx,
					c * (CARD_WIDTH + GRID_MARGIN),
					r * (CARD_HEIGHT + GRID_MARGIN),
					cn
				)
			}
		}
	}
}


function get_card_num(x, y) {
	for (let r = 0; r < 5; r++) {
		for (let c = 0; c < 3; c++) {
			let x_l = (CARD_WIDTH + GRID_MARGIN) * c;
			let y_l = (CARD_HEIGHT + GRID_MARGIN) * r;
			if ((x >= x_l && x <= x_l + CARD_WIDTH) && (y >= y_l && y <= y_l + CARD_HEIGHT)) {
				return r * 3 + c;
			}
		}
	}
	return -1;
}


function click_card(cn) {
	if (cn >= 0 && cn < cards.length) {
		if (clicked.has(cn)) {
			clicked.delete(cn);
		} else {
			clicked.add(cn);
		}
		if (found.has(cn)) {
			found.delete(cn);
		}
	}
	update();

	if (clicked.size == 3) {
		if (is_set(...[...clicked].map(z => cards[z]))) {
			// alert('set!');
			for (let el of clicked) {
				if (deck.length > 0 && cards.length <= 12) {
					cards[el] = deck.pop();
				} else {
					cards[el] = null;
				}
			}
			cards = cards.filter(z => z);
		} else {
			alert('not a set :(')
		}
		clicked = new Set();
	} 
	update();
	
}


function get_all_combos(n, k, min) {
	min = min || 0;
	let ret = [];
	if (k == 1) {
		for (let i = min; i < n; i++) {
			ret.push([i]);
		}
	} else {
		for (let i = min; i < n; i++) {
			for (let comb of get_all_combos(n, k - 1, i + 1)) {
				comb.push(i);
				ret.push(comb);
			}
		}
	}
	return ret;	
}


function find_set() {
	clicked = new Set();
	found = new Set();
	for (let comb of get_all_combos(cards.length, 3)) {
		if (is_set(...comb.map(z => cards[z]))) {
			found.add(comb[0]);
			found.add(comb[1]);
			found.add(comb[2]);
			update();
			return;
		}
	}
	alert('no set to find');
}


function add_cards() {
	if (cards.length == 12) {
		for (let i = 0; i < 3; i++) {
			if (deck.length > 0) {
				cards.push(deck.pop());
			}
		}
		update();
	}
}




new_game();



















