
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");

//        seg  =   0       1      2      3      4      5      6        num
const FIGURES = [[true , true , false, true , true , true , true ], // zero
                 [false, false, false, true , false, false, true ], // one
                 [true , false, true , true , true , true , false], // two
                 [true , false, true , true , false, true , true ], // three
                 [false, true , true , true , false, false, true ], // four
                 [true , true , true , false, false, true , true ], // five
                 [true , true , true , false, true , true , true ], // six
                 [true , false, false, true , false, false, true ], // seven
                 [true , true , true , true , true , true , true ], // eight
                 [true , true , true , true , false, true , true ], // nine
                ];

const VERTICAL_SEGS = [1, 3, 4, 6];

const NUM_SEGMENTS = 7;
const NUM_NUMBERS = 4;

const WIDTH = 25;
const LENGTH = (333 - 3 * WIDTH) / 2;

const LEFT_OFFSETS = [50, 275, 550, 775];

const TOP_OFFSET = 333;

const SEGMENT_LOCS = [[WIDTH, 0],                           // 0
                      [0, WIDTH],                           // 1
                      [WIDTH, WIDTH + LENGTH],              // 2
                      [WIDTH + LENGTH, WIDTH],              // 3
                      [0, 2 * WIDTH + LENGTH],              // 4
                      [WIDTH, 2 * WIDTH + 2 * LENGTH],      // 5
                      [WIDTH + LENGTH, 2 * WIDTH + LENGTH], // 6
                     ];

const DARK = 0.05;


function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
		stroke = true;
	}
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
	if (fill) {
		ctx.fill();
	}
	if (stroke) {
		ctx.stroke();
	}
}


function update() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var date = new Date();

	var hour = "0" + date.getHours();
	var min = "0" + date.getMinutes();

	var a = hour.substring(hour.length - 2, hour.length - 1);
	var b = hour.substring(hour.length - 1);
	var c = min.substring(min.length - 2, min.length - 1);
	var d = min.substring(min.length - 1);

	var numbers = [a, b, c, d];

	var x, y, w, h;
	for (var num = 0; num < NUM_NUMBERS; num++) {
		for (var seg = 0; seg < NUM_SEGMENTS; seg++) {
			ctx.fillStyle = "rgb(102, 255, 51, " + (FIGURES[numbers[num]][seg] ? 1 : DARK) + ")";
			x = LEFT_OFFSETS[num] + SEGMENT_LOCS[seg][0];
			y = TOP_OFFSET + SEGMENT_LOCS[seg][1];
			w = VERTICAL_SEGS.includes(seg) ? WIDTH : LENGTH;
			h = w == WIDTH ? LENGTH : WIDTH;
			roundRect(ctx, x, y, w, h, WIDTH / 2.5, true, false);
		}
	}

	ctx.fillStyle = "rgb(102, 255, 51, " + (date.getMilliseconds() < 500 ? 1 : DARK) + ")";
	roundRect(ctx, 500 - 15, 500 - 65 - 15, 30, 30, 5, true, false);
	roundRect(ctx, 500 - 15, 500 + 65 - 15, 30, 30, 5, true, false);


}

setInterval(update, 1);
