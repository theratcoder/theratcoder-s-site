function drawText(canvas, text, x, y, style) {
	var context = canvas.context;
	context.font = style;
	context.fillText(text, x, y);
}

function drawRect(canvas, 
	x, 
	y, 
	width, 
	height, 
	linewidth, // not used if fill is set to true
	style,
	fill,
	opacity) 
{	
	var context = canvas.context;
	context.globalAlpha = opacity;
	
	context.beginPath();
	context.rect(x, y, width, height);
	if (fill) {
		context.fillStyle = style;
		context.fill();
		context.fillStyle = "black";
	}
	else {
		context.lineWidth = linewidth;
		context.strokeStyle = style;
		context.stroke();
		context.strokeStyle = "black";
	}
	context.globalAlpha = 1.0;
}

function drawCircle(canvas, 
	x, 
	y, 
	radius,
	iRadius, // inner radius, not used if gradient is false 
	color1, 
	color2, // not used if gradient is false 
	fill, // ignored if gradient is true
	gradient) 
{
	var context = canvas.context;
	
	if (gradient) {
		var gradient = context.createRadialGradient(x,
			y,
			iRadius,
			x,
			y,
			radius);
		gradient.addColorStop(0, color1);
		gradient.addColorStop(1, color2);
		
		context.beginPath();
		context.fillStyle = gradient;
		context.arc(x, y, radius, 0, 2 * Math.PI);
		context.fill();
	}
	
	else {
		if (fill) {
			context.beginPath();
			context.fillStyle = color1;
			context.arc(x, y, radius, 0, 2 * Math.PI);
			context.fill();
		}
		else {
			context.beginPath();
			context.strokeStyle = color1;
			context.arc(x, y, radius, 0, 2 * Math.PI);
			context.stroke();
			context.strokeStyle = "";
		}
	}
}

function drawLine(canvas, spt, ept, style, rotation) {
	var context = canvas.context;
	context.beginPath();
	
	if (rotation != 0) {
		context.translate(spt.x, spt.y);
		context.rotate(rotation);
		context.translate(-spt.x, -spt.y);
	}
	
	context.strokeStyle = style;
	
	context.moveTo(spt.x, spt.y);
	context.lineTo(ept.x, ept.y);
	
	context.stroke();
	context.closePath();
	
	context.setTransform(1, 0, 0, 1, 0, 0);
}