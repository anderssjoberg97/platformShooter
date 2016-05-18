var canvas, ctx, width=960, height=640;
var player={
        x:(width/2)-(24/2), 
        y:height-200, 
        width:24, 
        height:24,
        speed:5,
        velX:0,
        velY:0,
        jumping:true,
        grounded:false
    };
var weapons=[{name:"Pickadoll",reloadTime:0.2*60,reloading:0,projectileSpeed:8}];
var enemy={
    x:30,
    y:150,
    width:92,
    height:24,
    velX:0,
    velY:0,
    hp:100,
    mode:0,
    modeTimer:0,
    modeVar:{
        targetX:null,
        targetY:null,
        distance:null,
        avgSpeed:3,
        maxSpeed:8,
        frame:0,
        numFrames:null
    }
};
var keys=[], mouse={x:null,y:null,down:false};
var friction=0.8, gravity=0.2;
var playerBullets=[], boxes=[];
var frameNum=0;

boxes.push({
    x: 0,
    y: height-48,
    width: 600,
    height: 48
});
boxes.push({
    x: 650,
    y: height-100,
    width: 200,
    height: 48
});


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
    player.velX *= friction;
    player.velY += gravity;
 
    
  
}
function shootingComponent(){
    if(mouse.down && weapons[0].reloading>=weapons[0].reloadTime){
        weapons[0].reloading=0;
        var velX;
        var velY;
        if((player.x+(player.width/2))==mouse.x){
            if(mouse.y<(player.y+(player.height/2))){
                velY=-weapons[0].projectileSpeed;
                velX=0;
            }else{
                velY=weapons[0].projectileSpeed;
                velX=0;
            }
        }else{
            var angle=Math.atan(Math.abs((player.y+(player.height/2))-mouse.y)/Math.abs((player.x+(player.width/2))-mouse.x));
            if(mouse.y>(player.y+(player.height/2)))
                velY=Math.sin(angle)*weapons[0].projectileSpeed;
            else
                velY=-Math.sin(angle)*weapons[0].projectileSpeed;
            if(mouse.x>(player.x+(player.width/2)))
                velX=Math.cos(angle)*weapons[0].projectileSpeed;
            else
                velX=-Math.cos(angle)*weapons[0].projectileSpeed;
        }
        playerBullets.push({
            x:player.x+(player.width/2),
            y:player.y+(player.height/2),
            width:4,
            height:4,
            velX:velX,
            velY:velY
        });
    }
    weapons[0].reloading++; 
}
function enemyAi(){
    //Mode 0 --> Fly to a random point in a smooth movement
    if(enemy.mode==0){
    	//Generate a new target position if none is set or if the target generated is to close to the enemys current position
        while(enemy.modeVar.targetX==null || enemy.modeVar.targetY==null || (Math.sqrt((Math.pow((enemy.x+(enemy.width/2))-enemy.modeVar.targetX,2)+Math.pow((enemy.y+(enemy.height/2))-enemy.modeVar.targetY,2)))<100 && enemy.modeVar.frame==0)){
            enemy.modeVar.targetX=(enemy.width/2)+Math.floor((Math.random()*(width-enemy.width)));
            enemy.modeVar.targetY=enemy.height+Math.floor((Math.random()*(height/2)));
            enemy.modeVar.numFrames=Math.floor(Math.sqrt((Math.pow((enemy.x+(enemy.width/2))-enemy.modeVar.targetX,2)+Math.pow((enemy.y+(enemy.height/2))-enemy.modeVar.targetY,2)))/enemy.modeVar.avgSpeed);
            enemy.modeVar.frame=0;
        }
        var a=-((6*enemy.modeVar.numFrames*enemy.modeVar.avgSpeed)/Math.pow(enemy.modeVar.numFrames,3));
        var b=-(enemy.modeVar.numFrames*a);
        var vel=a*Math.pow(enemy.modeVar.frame,2)+b*enemy.modeVar.frame;
        if(vel>=0 && enemy.modeVar.frame<=enemy.modeVar.numFrames){
        	var velX, velY;
        	var angle = Math.acos((enemy.modeVar.targetX-(enemy.x+(enemy.width/2)))/Math.sqrt((Math.pow((enemy.x+(enemy.width/2))-enemy.modeVar.targetX,2)+Math.pow((enemy.y+(enemy.height/2))-enemy.modeVar.targetY,2))));
        	velX=Math.cos(angle)*vel;
        	if((enemy.modeVar.targetY-(enemy.y+(enemy.height/2)))>=0){
        		velY=Math.sin(angle)*vel;
        	}else{
        		velY=-Math.sin(angle)*vel;
        	}
        	enemy.x+=velX;
        	enemy.y+=velY;
        	enemy.modeVar.frame++;
        }else{
        	enemy.modeVar.targetX=null;
        	enemy.modeVar.targetY=null;
        	enemy.modeVar.numFrames=null;
        	enemy.modeVar.frame=0;
        }

        
        
    }
}
function collisionCheck(obj1, obj2){
    var vX = (obj1.x + (obj1.width / 2)) - (obj2.x + (obj2.width / 2)),
        vY = (obj1.y + (obj1.height / 2)) - (obj2.y + (obj2.height / 2)),
        hWidths = (obj1.width / 2) + (obj2.width / 2),
        hHeights = (obj1.height / 2) + (obj2.height / 2),
        colDir = null;
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                obj1.y += oY;
            } else {
                colDir = "b";
                obj1.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                obj1.x += oX;
            } else {
                colDir = "r";
                obj1.x -= oX;
            }
        }
    }
    return colDir;
}
function bulletCollision(obj1, obj2){
    var vX = (obj1.x + (obj1.width / 2)) - (obj2.x + (obj2.width / 2)),
        vY = (obj1.y + (obj1.height / 2)) - (obj2.y + (obj2.height / 2)),
        hWidths = (obj1.width / 2) + (obj2.width / 2),
        hHeights = (obj1.height / 2) + (obj2.height / 2),
        colDir = null;
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
            } else {
                colDir = "b";
            }
        } else {
            if (vX > 0) {
                colDir = "l";

            } else {
                colDir = "r";
            }
        }
    }
    return colDir;
}
function render() {
    requestAnimFrame(render);
    playerMovement();
    shootingComponent();
    enemyAi();
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle="orange";
    ctx.beginPath();
    for(var i=0;i<playerBullets.length;i++){
        if(playerBullets[i].x<0 || playerBullets[i].x>width || playerBullets[i].y<0 || playerBullets[i].y>height){
            playerBullets.splice(i,1);
        }else if(bulletCollision(playerBullets[i],enemy) && enemy.hp>0){
            playerBullets.splice(i,1);
            enemy.hp-=5;
            console.log(enemy.hp);
        }else{
            ctx.rect(playerBullets[i].x, playerBullets[i].y, playerBullets[i].width, playerBullets[i].height);
            playerBullets[i].x+=playerBullets[i].velX;
            playerBullets[i].y+=playerBullets[i].velY;
        }
    }
    ctx.fill();
    ctx.fillStyle="black";
    ctx.beginPath();
    player.grounded=false;
    for(var i=0;i<boxes.length;i++){
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        var dir = collisionCheck(player, boxes[i]);
        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }
        
    }
    if(player.grounded){
         player.velY = 0;
    }
    player.x += player.velX;
    player.y += player.velY;
    
    ctx.fill();
    if(enemy.hp>0){
        ctx.fillStyle="red";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
    
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function init(){
    canvas=document.getElementById("canvas");
    ctx=canvas.getContext("2d");
    canvas.width=width;
    canvas.height=height;

    document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    });
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });
    canvas.onmousedown=function(e){
        var e = e || window.event;
        if ('object' === typeof e && e.button==0){
            mouse.x=e.clientX-canvas.getBoundingClientRect().left;
            mouse.y=e.clientY-canvas.getBoundingClientRect().top;
            mouse.down=true;
        }
    };
    canvas.onmouseup=function(e){
        var e = e || window.event;
        if ('object' === typeof e && e.button==0){
            mouse.down=false;
        }
    };
    canvas.onmousemove=function(e){
        var e = e || window.event;
        if ('object' === typeof e && e.button==0){
            mouse.x=e.clientX-canvas.getBoundingClientRect().left;
            mouse.y=e.clientY-canvas.getBoundingClientRect().top;
        }
    };
    
    render();
}

