
const canvas = document.getElementById("display");
const ctx = canvas.getContext("2d");




const SIZE = canvas.height;


var num_squares = 5;
var color;




function update_display() {
	// clear the display
	ctx.clearRect(0,0,SIZE, SIZE);

}



function reset_game() {

}



window.addEventListener("deviceorientation", function(event) {
	document.getElementById('output').innerHTML += JSON.stingify(event);
    // process event.alpha, event.beta and event.gamma
}, true);
