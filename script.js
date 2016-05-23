var canvas, ctx, width=480, height=640;
var paddle={
	x:(width/2)-32,
	y:height-24,
	width:64,
	height:8
};
var ball={
	x:(width/2)-4,
	y:paddle.y-10,
	width:8,
	speed:8,
	speedIncrease:0.5,
	angle:Math.PI+0.5+Math.random()*(Math.PI-1),
}
console.log(ball.angle);
var score=0;


window.onload = function(){init();};
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(callback, element){
          window.setTimeout(callback, 1000 / 60);
        };
})();


function playerMovement(){
    if (keys[38] || keys[32] || keys[87]) {
        if(!player.jumping && player.grounded){
            player.jumping = true;
            player.grounded=false;
            player.velY = -player.speed*1;
        }
    }
    if (keys[39] || keys[68]) {
        if (player.velX < player.speed) {             
            player.velX++;         
        }     
    }     
    if (keys[37] || keys[65]) {               
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }
 
    
  
}
function ballMovement(){

	//If collision with right side
	if(ball.x+(ball.speed*Math.cos(ball.angle))+ball.width>=width){
		var excess=width-(ball.x+(ball.speed*Math.cos(ball.angle))+ball.width+ball.width-width);
		
		ball.x=excess;
		if(ball.speed*Math.sin(ball.angle)<0)
			ball.angle=Math.PI+(2*Math.PI-ball.angle);
		else
			ball.angle=Math.PI*0.5+(Math.PI*0.5-ball.angle);
		console.log("Ex: "+excess+" X: "+(excess+(ball.speed*Math.cos(ball.angle))));
	}
	//If collision with left side
	else if(ball.x+(ball.speed*Math.cos(ball.angle))<=0){
		
		var excess=-ball.x-(ball.speed*Math.cos(ball.angle));
		//var excess=-Math.floor(ball.x+(ball.speed*Math.cos(ball.angle)));
		
		ball.x=excess;
		if(ball.speed*Math.sin(ball.angle)<0)
			ball.angle=3*Math.PI-ball.angle;
		else
			ball.angle=Math.PI-ball.angle;
		console.log("Ex: "+excess+" X: "+(excess+(ball.speed*Math.cos(ball.angle))));
	}
	//If no collision with left or right borders
	else{
		ball.x+=ball.speed*Math.cos(ball.angle);
	}

	//If collision with top border
	if(ball.y+ball.speed*Math.sin(ball.angle)<=0){
		var excess=-(ball.y+ball.speed*Math.sin(ball.angle));
		ball.y=excess;
		console.log(excess);
		if(ball.speed*Math.cos(ball.angle)>0)
			ball.angle=Math.PI*0.5-(ball.angle-3*Math.PI*0.5);
		else
			ball.angle=Math.PI*0.5+(3*Math.PI*0.5-ball.angle);
	}
	else if(ball.y+ball.speed*Math.sin(ball.angle)+ball.width>=paddle.y){
		if(ball.x+ball.width>=paddle.x && ball.x<=paddle.x+paddle.width){
			var excess=ball.y+ball.speed*Math.sin(ball.angle)+ball.width+ball.width-paddle.y;
			ball.y=paddle.y-excess;
			score++;
			ball.speed+=ball.speedIncrease;
			if(ball.speed*Math.cos(ball.angle)>0)
				ball.angle=Math.PI*3*0.5+(Math.PI*0.5-ball.angle);
			else
				ball.angle=Math.PI*2-ball.angle;
		}
		else if(ball!=null){
			alert("Fucking lost boys");
			ball=null;
		}
	}
	else{
		ball.y+=ball.speed*Math.sin(ball.angle);
	}
	
}
function render() {
	ballMovement();
    requestAnimFrame(render);
    ctx.fillStyle="#99ddff";
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle="#fff"
    ctx.font = "24px Arial";
    ctx.alignText="right";
    ctx.fillText(score, width-24, 28);
    
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    ctx.fillRect(ball.x, ball.y, ball.width, ball.width);
}

function init(){
    canvas=document.getElementById("canvas");
    ctx=canvas.getContext("2d");
    canvas.width=width;
    canvas.height=height;



    canvas.onmousemove=function(e){
        var e = e || window.event;
        if ('object' === typeof e && e.button==0){
            paddle.x=e.clientX-canvas.getBoundingClientRect().left-paddle.width/2;
        }
    };
    
    render();
}

