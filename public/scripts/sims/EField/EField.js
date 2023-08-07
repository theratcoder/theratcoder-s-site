var HTMLCanvas;
var EFCanvas;
var charges = [];

var chargeRange;
var chargeVal;

var goBtn;
var stopBtn;
var resetBtn;
var refreshBtn;
var randomizeBtn;
var going = false;
var goingInterval;

var gradientChargesCheck;
var gradientCharges = true;

var eqPotentialLinesCheck;
var eqPotentialLines = true;

var fieldLinesCheck;
var feildLines = true;

var numFieldLinesInput;
var numFieldLines = 5;

var initVelocityCheck;
var initVelocity = true;

var wallBoundaryCheck;
var wallBoundary = false;

var sysChargeDisp;

const hitTolerance = 4.75;

var goInterval;

class Charge {
	charge;
	
	x;
	y;
	
	vX = 0;
	vY = 0;
	
	constructor(charge, point) {
		this.charge = charge;
		this.x = point.x;
		this.y = point.y;
	}
	
	setVelocity(vX, vY) {
		this.vX += vX;
		this.vY += vY;
	}
	
	move() {
		this.x += this.vX;
		this.y += this.vY;
		return new Point(this.x, this.y);
	}
	
	bounce(dir) {
		switch (dir) {
		case "vertical":
			this.vY = -this.vY;
			break;
		case "horizontal":
			this.vX = -this.vX;
			break;
		default:
			this.vX = -this.vX;
			this.vY = -this.vY;
		}
	}
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return new Point(x, y);
}

function updateSCD() {
	var total = 0;
	
	for (var i = 0; i < charges.length; i++)
		total += charges[i].charge;
	
	sysChargeDisp.innerHTML = total;
}

function redraw() {
	chargeVal = chargeRange.valueAsNumber;
	
	EFCanvas.redraw(chargeVal, 
		charges, 
		gradientCharges, 
		numFieldLines, 
		hitTolerance, 
		fieldLines,
		eqPotentialLines);
		
	updateSCD();
}

function go() {
	if (going) {
		chargeVal = chargeRange.valueAsNumber;
		charges = EFCanvas.go(charges, gradientCharges, chargeVal, wallBoundary);
	}
	else {
		clearInterval(goInterval);
	}
	
	updateSCD();
}

function setEvents() {
	HTMLCanvas.addEventListener("mousedown", (e) => {
		if (chargeVal != 0 && !going) {
			var pt = getCursorPosition(EFCanvas, e);
			charges.push(new Charge(chargeVal, pt));
			redraw();
		}
	});
	
	chargeRange.oninput = () => {
		chargeVal = chargeRange.valueAsNumber;
		if (!going) redraw();
	}
	
	goBtn.onclick = () => {
		if (!going) {
			going = true;
			
			if (initVelocity) {
				for (var i = 0; i < charges.length; i++) 
					charges[i].setVelocity((Math.random() * 10) - 5, (Math.random() * 10) - 5);
			}
			
			goInterval = setInterval(go, 17);
		}
	}
	
	stopBtn.onclick = () => {
		going = false;
		redraw();
	}
	
	resetBtn.onclick = () => {
		location.reload();
	}
	
	refreshBtn.onclick = () => {
		redraw();
	}
	
	randomizeBtn.onclick = () => {
		if (going) return;
		
		for (var i = 0; i < 5; i++) {
			var x = Math.round(Math.random() * EFCanvas.canvas.width);
			var y = Math.round(Math.random() * EFCanvas.canvas.height);
			
			var charge = Math.round((Math.random() * 18) - 9);
			charge = charge != 0 ? charge : (Math.random() < 0.5 ? 1 : -1);
			
			charges.push(new Charge(charge, new Point(x, y)));
		}
		
		redraw();
	}
	
	gradientChargesCheck.onchange = () => {
		gradientCharges = gradientChargesCheck.checked;
		if (!going) redraw();
	}
	
	eqPotentialLinesCheck.onchange = () => {
		eqPotentialLines = eqPotentialLinesCheck.checked;
		if (!going) redraw();
	}
	
	fieldLinesCheck.onchange = () => {
		fieldLines = fieldLinesCheck.checked;
		numFieldLinesInput.readOnly = !fieldLines;
		
		if (!going) redraw();
	}
	
	numFieldLinesInput.onchange = () => {
		numFieldLines = numFieldLinesInput.value;
		if (numFieldLines == "") numFieldLines = 5;
		
		if (!going) redraw();
	}
	
	initVelocityCheck.onchange = () => {
		initVelocity = initVelocityCheck.checked;
		if (!going) redraw();
	}
	
	wallBoundaryCheck.onchange = () => {
		wallBoundary = wallBoundaryCheck.checked;
		if (!going) redraw();
	}
}

window.onload = () => {
	HTMLCanvas = document.querySelector("#EFieldCanvas");
	EFCanvas = new EFieldCanvas(HTMLCanvas);
	chargeRange = document.querySelector("#charge");
	goBtn = document.querySelector("#go");
	stopBtn = document.querySelector("#stop");
	resetBtn = document.querySelector("#reset");
	refreshBtn = document.querySelector("#refresh");
	randomizeBtn = document.querySelector("#randomize");
	gradientChargesCheck = document.querySelector("#gradientCharges");
	eqPotentialLinesCheck = document.querySelector("#eqPotentialLines");
	fieldLinesCheck = document.querySelector("#fieldLines");
	numFieldLinesInput = document.querySelector("#numFieldLines");
	initVelocityCheck = document.querySelector("#initVelocity");
	wallBoundaryCheck = document.querySelector("#wallBoundary");
	sysChargeDisp = document.querySelector("#sysChargeDisp");
	
	setEvents();
	
	redraw();
}