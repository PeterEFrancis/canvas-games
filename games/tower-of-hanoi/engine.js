
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

const MARGIN = 100;


var num_pegs;
var num_discs;
var peg_width;
var peg_space;
var peg_margin;
var disc_height;

var towers;

var selected;

var moves;


resize_to(3, 5);
reset();



function change_pegs(p) {
	resize_to(p, num_discs);
}

function change_discs(d) {
	console.log(d);
	resize_to(num_pegs, d)
}


function resize_to(p, d) {
	num_pegs = p;
	num_discs = d;
	var sect = (canvas.width - MARGIN * 2) / num_pegs;
	peg_margin = sect / 10;
	peg_width = (sect - peg_margin * 2) / 7;
	peg_space = (sect - peg_margin * 2 - peg_width) / 2;
	disc_height = (canvas.height - 2 * MARGIN) / (num_discs + 1);
	reset();
}


function reset() {

	// reset towers
	towers = [];
	for (var i = 0; i < num_pegs; i++) {
		towers[i] = [];
	}
	for (var i = num_discs; i > 0; i--) {
		towers[0].push(i);
	}

	// reset selected
	selected = -1;


	// reset moves
	moves = 0;
}


function click(s) {
	if (selected == -1) {
		selected = s;
	} else {
		if (towers[s].length == 0 || towers[s][towers[s].length - 1] > towers[selected][towers[selected].length - 1]) {
			towers[s].push(towers[selected].pop());
			moves++;
		}
		selected = -1;
	}
}


function update() {

	// background
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgb(0,0,50)";
	ctx.fillRect(0, canvas.height - MARGIN, canvas.width, MARGIN);

	// pegs
	for (var i = 0; i < num_pegs; i++) {
		var x1 = MARGIN + i * (2 * (peg_space + peg_margin) + peg_width) + peg_space + peg_margin;
		var x2 = x1 + peg_width;
		var my_gradient = ctx.createLinearGradient(x1, 0, x2, 0);
		my_gradient.addColorStop(0, "grey");
		my_gradient.addColorStop(1, "lightgrey");
		ctx.fillStyle = my_gradient;
		ctx.fillRect(x1, MARGIN, x2 - x1, canvas.height - MARGIN * 2);
	}

	// discs
	for (var i = 0; i < num_pegs; i++) {
		for (var j = 0; j < towers[i].length; j++) {
			if (j == towers[i].length - 1 && selected == i) {
				ctx.shadowBlur = 20;
				ctx.shadowColor = "yellow";
			}
			ctx.fillStyle = "rgb(" + ((towers[i][j] / num_discs) * 175 + 80) + ",0,0)";
			var x = MARGIN + i * (2 * (peg_space + peg_margin) + peg_width) + peg_margin + (1 - (towers[i][j] / num_discs)) * peg_space;
			var y = canvas.height - MARGIN - (j + 1) * disc_height;
			ctx.fillRect(x, y, peg_width + (towers[i][j] / num_discs) * peg_space * 2, disc_height);
			ctx.strokeStyle = "black";
			ctx.lineWidth = 5;
			ctx.strokeRect(x, y, peg_width + (towers[i][j] / num_discs) * peg_space * 2, disc_height);
		}
		ctx.shadowBlur = 0;
	}

	// moves counter
	document.getElementById('moves').innerHTML = moves;

}
setInterval(update, 10);
