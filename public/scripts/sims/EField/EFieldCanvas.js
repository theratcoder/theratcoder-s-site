class Point {
	x;
	y;
	
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Canvas {
	HTMLCanvas;
	context;
	width;
	height;
	
	topLeft;
	topRight;
	bottomLeft;
	bottomRight;
	
	constructor(HTMLCanvas) {
		this.HTMLCanvas = HTMLCanvas;
		this.context = HTMLCanvas.getContext("2d");
		
		this.width = HTMLCanvas.width;
		this.height = HTMLCanvas.height;
		
		this.topLeft = new Point(0, 0);
		this.topRight = new Point(this.width, 0);
		this.bottomRight = new Point(0, this.height);
		this.bottomLeft = new Point(this.width, this.height);
		
		this.context.save();
	}
	
	clear() {
		this.context.clearRect(0, 0, this.width, this.height);
	}
	
	getClientRect() {
		return this.HTMLCanvas.getBoundingClientRect();
	}
	
	resetContext() {
		this.context.restore();
	}
	
	isOffOfCanvas(point) {
		if (point.x < 0 || point.x > this.width || point.y < 0 || point.y > this.height) return true;
		return false;
	}
	
	degreesToRadians(deg) {
		return deg * (Math.PI / 180);
	}
	
	distance(pt1, pt2) {
		return Math.sqrt(((pt1.x - pt2.x) ** 2) + ((pt1.y - pt2.y) ** 2));
	}
}

//TODO: refactor to an extension of the Canvas class
class EFieldCanvas {
	canvas;
	chargeDispW = 100;
	chargeDispH = 30;
	
	horizontalBlock;
	verticalBlock;

	horizontalBlockHalf;
	verticalBlockHalf;
	
	constructor(htmlCanvas) {
		this.canvas = new Canvas(htmlCanvas);
		
		this.horizontalBlock = this.canvas.width / 10;
		this.verticalBlock = this.canvas.height / 10;
		
		this.horizontalBlockHalf = this.horizontalBlock / 2;
		this.verticalBlockHalf = this.verticalBlock / 2;
	}
	
	drawChargeDisplay(chargeVal) {
		drawRect(this.canvas,
			(this.canvas.width - this.chargeDispW),
			0,
			this.chargeDispW, 
			this.chargeDispH, 
			0,
			"lightgrey",
			true,
			0.5);
			
		drawText(this.canvas,
			"Charge: " + chargeVal,
			(this.canvas.width - 95),
			21,
			"20px Arial");
	}
	
	drawCharges(charges, gradientCharges) {
		for (var i = 0; i < charges.length; i++) {
			var charge = charges[i];
			var color;
			
			if (charge.charge < 0) {
				color = "blue";
			}
			else {
				color = "red";
			}
			
			if (gradientCharges) {
				drawCircle(this.canvas,
					charge.x,
					charge.y,
					(Math.abs(charge.charge) * 1.75) + 3,
					2,
					color,
					"white",
					true,
					true);
			}
			else {
				drawCircle(this.canvas,
					charge.x,
					charge.y,
					(Math.abs(charge.charge) * 1.75) + 3,
					0,
					color,
					"",
					true,
					false);
			}
		}
	}
	
	drawEqLines(charges) {
		// don't bother if there aren't any charges
		if (charges.length == 0) return;
		
	    var fieldFilled = [];
		
		for (var i = 0; i < 10; i++) {
			fieldFilled.push([]);
			
			for (var j = 0; j < 10; j++) {
				fieldFilled[i].push(false);
			}
		}
		
	    var calculatedFields = [];
	    var maxForce = 0;

	    for (var i = 0; i < fieldFilled.length; i++) {
	        var direction = 1;
	        for (var jj=0; jj < fieldFilled[i].length; jj++) {
	           if (!fieldFilled[i][jj]) {
	               //create a path here

	               //Iterate at most 2 times in case the surface gets out of the area
	               for (var circleTimes = 0; circleTimes < 3; circleTimes+=2) {

	                   //Define the center of the current block as a starting point of the surface
	                   var curX = i * this.horizontalBlock + this.horizontalBlockHalf;
	                   var curY = jj * this.verticalBlock + this.verticalBlockHalf;
					   var curPt = new Point(curX, curY);

	                   var direction = 1 - circleTimes;
	                   var dots = [];
	                   dots.push(new Point(curPt.x, curPt.y));

	                   //Superposition the fields from all charges, and get the resulting force vector
	                   var dirX = 0;
	                   var dirY = 0;
	                   var totalForce = 0;
	                   for (var j = 0; j < charges.length; j++) {
	                       var distX = curPt.x - charges[j].x;
	                       var distY = curPt.y - charges[j].y;
	                       var distanceSq = distX * distX + distY * distY;
	                       var force = charges[j].charge / distanceSq;

	                       var distanceFactor = force / Math.sqrt(distanceSq);

	                       //Measure the initial force in order to match the equipotential surface points
	                       totalForce += force;
	                       dirX += distX * distanceFactor;
	                       dirY += distY * distanceFactor;
	                   }

	                   //Maximum 2000 dots per surface line
	                   var times = 2000;
	                   while (times-- > 0) {

	                       var dirTotal = Math.sqrt(dirX * dirX + dirY * dirY);
	                       var stepX = dirX / dirTotal;
	                       var stepY = dirY / dirTotal;
	                       //The equipotential surface moves normal to the force vector
	                       curPt.x = curPt.x + direction * 6 * stepY;
	                       curPt.y = curPt.y - direction * 6 * stepX;

	                       //Correct the exact point a bit to match the initial force as near it can
	                       var minForceIndex = -1;
	                       var minForceDiff = 0;
	                       var minDirX = 0;
	                       var minDirY = 0;
	                       var minCurX = 0;
	                       var minCurY = 0;

	                       curPt.x -= 3 * stepX;
	                       curPt.y -= 3 * stepY;

	                       for (var pointIndex = 0; pointIndex < 7; pointIndex++, curPt.x += stepX, curPt.y += stepY) {
	                           dirX = 0;
	                           dirY = 0;

	                           var forceSum = 0;
	                           for (var j = 0; j < charges.length; j++) {
	                               var distX = curPt.x - charges[j].x;
	                               var distY = curPt.y - charges[j].y;
	                               var distanceSq = distX ** 2 + distY ** 2;
	                               var force = charges[j].charge / distanceSq;

	                               var distanceFactor = force / Math.sqrt(distanceSq);


	                               //Measure the initial force in order to match the equipotential surface points
	                               forceSum += force;
	                               dirX += distX * distanceFactor;
	                               dirY += distY * distanceFactor;
	                           }

	                           var forceDiff = Math.abs(forceSum - totalForce);

	                           if (minForceIndex == -1 || forceDiff < minForceDiff) {
	                               minForceIndex = pointIndex;
	                               minForceDiff = forceDiff;
	                               minDirX = dirX;
	                               minDirY = dirY;
	                               minCurX = curPt.x;
	                               minCurY = curPt.y;
	                           } else {
	                               break;
	                           }
	                       }

	                       //Set the corrected equipotential point
	                       curPt.x = minCurX;
	                       curPt.y = minCurY;
	                       dirX = minDirX;
	                       dirY = minDirY;

	                       //Mark the containing block as filled with a surface line.
	                       var indI = parseInt(curPt.x / this.horizontalBlock);
	                       var indJ = parseInt(curPt.y / this.verticalBlock);
	                       if (indI >= 0 && indI < fieldFilled.length) {
	                           if (indJ >= 0 && indJ < fieldFilled[indI].length) {
	                            fieldFilled[indI][indJ] = true;
	                           }
	                        }

	                       //Add the dot to the line
	                       dots.push(new Point(curPt.x, curPt.y));

	                       if (dots.length > 5) {
	                           //If got to the begining, a full circle has been made, terminate further iterations
	                           if (indI == i && indJ == jj) {
	                               distX = dots[0].x - curPt.x;
	                               distY = dots[0].y - curPt.y;
	                               if (distX * distX + distY * distY <= 49) {
	                                   dots.push(new Point(dots[0].x, dots[0].y));
	                                   times = 0;
	                                   circleTimes = 3;
	                               }
	                           }
	                           //If got out of the area, terminate furhter iterations for this turn.
	                           if (curPt.x < 0 || curPt.x > this.canvas.width || curPt.y < 0 || curPt.y > this.canvas.height) {
	                               times = 0;
	                           }
	                       }
	                   }

	                   calculatedFields.push([totalForce, dots]);
	                   maxForce = Math.max(maxForce, Math.abs(totalForce));
	               }
	           }
	       }
	    }
		
	    //Iterate through each generated equipotential surface
	    for (var i = 0; i < calculatedFields.length; i++) {
	        var pair = calculatedFields[i];
	        var stroke = "";
	        var percentage = 9 - Math.min(9,parseInt(Math.abs(10 * pair[0]) / maxForce ));
			
	        //Set the stroke to be proportional to the surface potential
	        if (pair[0]>=0) {
	            //positive
	            stroke = "#" + "b" + percentage + "" + percentage;
	        } else {
	            //negative
	            stroke = "#" + percentage + "" + percentage + "b";
	        }

	        //Render the line
			var start = new Point(calculatedFields[i][1][0].x, calculatedFields[i][1][0].y);
			var end;
			
	        for (var j = 0; j < pair[1].length; j++) {
	        	if (j != pair[1].length - 1) end = pair[1][j + 1];
				else break;
				
				drawLine(this.canvas,
					start,
					end,
					stroke,
					0);
					
				start = end;
	        }
	    }
	}
	
	drawFieldLines(charges, linesPerCharge, hitTolerance) {
		for (var i = 0; i < charges.length; i++) {
			var linesToDraw = Math.abs(charges[i].charge) * linesPerCharge;
			
			var polarity = (charges[i].charge > 0 ? 1 : -1);
			
			for (var j = 0; j < linesToDraw; j++) {
				var start;
				var end;
				var angle = (360 / linesToDraw) * j;
				
				if (charges.length == 1) {
					start = new Point(charges[i].x, charges[i].y);
					
					var distTL = this.canvas.distance(start, this.canvas.topLeft);
					var distTR = this.canvas.distance(start, this.canvas.topRight);
					var distBL = this.canvas.distance(start, this.canvas.bottomLeft);
					var distBR = this.canvas.distance(start, this.canvas.bottomRight);
					var maxDist = Math.max(distTL, distTR, distBL, distBR);
					
					if (maxDist == distTL) end = this.canvas.topLeft;
					else if (maxDist == distTR) end = this.canvas.topRight;
					else if (maxDist == distBL) end = this.canvas.bottomLeft;
					else end = this.canvas.bottomRight;
					
					drawLine(this.canvas, start, end, "black", this.canvas.degreesToRadians(angle));
					continue;
				}
				
				var startx = 1 * Math.cos(this.canvas.degreesToRadians(angle)) + charges[i].x;
				var starty = 1 * Math.sin(this.canvas.degreesToRadians(angle)) + charges[i].y;
				start = new Point(startx, starty);
				
				var cont = true;
				while (cont) {
					var hitcharge = false;
					var dirX = 0;
					var dirY = 0;
					
					for (var k = 0; k < charges.length; k++) {
						var distX = start.x - charges[k].x;
					    var distXSq = distX ** 2;
					    var distY = start.y - charges[k].y;
					    var distYSq = distY ** 2;
					    var distanceSq = distXSq + distYSq;

					   	var force = charges[k].charge / distanceSq;
					    var factor = force * polarity;
						
					    dirX += distX * factor;
					    dirY += distY * factor;
					}
					
					
	                var dirTotal = Math.sqrt((dirX ** 2) + (dirY ** 2));
	                var addFactor = 7 / dirTotal;
	                var newx = start.x + addFactor * dirX;
	                var newy = start.y + addFactor * dirY;
					
					end = new Point(newx, newy);
					drawLine(this.canvas,
						start,
						end,
						"black",
						0);
					
					start = end;
					
					for (var l = 0; l < charges.length; l++) {
						if (l == i) continue;
						
						hitcharge = (end.x < charges[l].x + hitTolerance) && (end.x > charges[l].x - hitTolerance) && (end.y < charges[l].y + hitTolerance) && (end.y > charges[l].y - hitTolerance);
						if (hitcharge) break;
					}
					
					cont = (!(this.canvas.isOffOfCanvas(end) || hitcharge));
				}
			}
		}
	}
	
	redraw(chargeVal, 
		charges, 
		gradientCharges, 
		linesPerCharge, 
		hitTolerance, 
		fieldLines,
		eqLines) 
	{
		this.canvas.clear();
		
		if (eqLines) this.drawEqLines(charges);
		
		if (fieldLines) this.drawFieldLines(charges, linesPerCharge, hitTolerance);
		
		this.drawCharges(charges, gradientCharges);
		
		this.drawChargeDisplay(chargeVal);
	}
	
	go(charges, gradientCharges, chargeVal, wall) {
		this.canvas.clear();
		
		for (var i = 0; i < charges.length; i++) {
			if (charges.length == 1) {
				var newPos = charges[i].move();
				if (this.canvas.isOffOfCanvas(newPos)) {
					if (!wall) {
						charges.splice(i, 1);
					}
					else {
						if (newPos.x < 0 || newPos.x > this.canvas.width) charges[i].bounce("horizontal");
						else charges[i].bounce("vertical");
					}
				}
				break;
			}
			
			var polarity = (charges[i].charge > 0 ? 1 : -1);
			var dirX = 0;
			var dirY = 0;
		
			for (var j = 0; j < charges.length; j++) {
				if (i == j) continue;
				
				var distX = charges[i].x - charges[j].x;
		    	var distXSq = distX ** 2;
		    	var distY = charges[i].y - charges[j].y;
		    	var distYSq = distY ** 2;
		    	var distanceSq = distXSq + distYSq;

		   		var force = charges[j].charge / distanceSq;
		    	var factor = force * polarity;
			
		    	dirX += distX * factor;
		    	dirY += distY * factor;
			}
		
        	var dirTotal = Math.sqrt((dirX ** 2) + (dirY ** 2));
        	var addFactor = 7 / dirTotal;
			
        	charges[i].setVelocity(addFactor * dirX, addFactor * dirY);
			var newPos = charges[i].move();
			
			if (this.canvas.isOffOfCanvas(newPos)) {
				if (!wall) {
					charges.splice(i, 1);
				}
				else {
					if (newPos.x < 0 || newPos.x > this.canvas.width) charges[i].bounce("horizontal");
					else charges[i].bounce("vertical");
				}
			}
		}
		this.drawCharges(charges, gradientCharges);
		this.drawChargeDisplay(chargeVal);
		
		return charges;
	}
	
	getClientRect() {
		return this.canvas.getClientRect();
	}
}