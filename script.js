var canvas, ctx; //Canvas är en variabel som håller DOM-elementet för canvaset. CTX är drawingContext för canvas. I detta fall 2D. 
var width=960, height=640;//Höjd och bredd på canvas
var player={
        x:(width/2)-(24/2), //x-position
        y:height-200, //y-position
        width:24, //bredd
        height:24, //höjd
        speed:5, //Hastighetsgräns
        velX:0, //Nuvarande hastighet i x-led
        velY:0, //Nuvarande hastighet i y-led
        jumping:true, //Variabel för att kolla om spelaren hoppar
        grounded:false //Variabel för att kolla om spelaren är på marken
    };
var weapons=[{name:"Pickadoll",reloadTime:0.2*60,reloading:0,projectileSpeed:8}]; //Array för olika vapenobjekt FÖR NÄRVARANDE BARA PICKADOLLEN I ARSENALEN
var enemy={
    x:30,
    y:150,
    width:92,
    height:24,
    velX:0,
    velY:0,
    hp:100, //HP på fienden
    mode:0, //modeXX-variabler är experimentiella för AIt. 
    modeTimer:0,
    modeVar:{
        targetX:null,
        targetY:null,
        graphX:null,
        graphY:null,
        graphA:null,
        graphB:null
    }
};
var keys=[], mouse={x:null,y:null,down:false}; //Variab
var friction=0.8, gravity=0.2; //Variabler som motverkar människostyrda rörelser hos spelaren. Kort sagt saktar ned hen.
var playerBullets=[], boxes=[]; //Arrayer för plattformsobjekt och skott
var frameNum=0; //Variabel för att logga grejor 

//Lägg till plattformar
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


window.onload = function(){init();};  //När dokumentet laddats färdigt körs init.
//Se till så att render körs kontinuerligt
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

//Funktion för att hantera knappnedtryck och hastigheter hos spelaren
function playerMovement(){
    //Om space w eller upp är nedtryckt
    if (keys[38] || keys[32] || keys[87]) {
        //Om spelaren inte redan hoppat
        if(!player.jumping && player.grounded){
            //Hoppa
            player.jumping = true;
            player.grounded=false;
            player.velY = -player.speed*1;
        }
    }
    //Om höger eller d är nedtryckt
    if (keys[39] || keys[68]) {
        //Hastigheten får ej överskrida player.speed
        if (player.velX < player.speed) {             
            player.velX++;         
        }     
    }     
    //Om vänster eller a är nedtryckt
    if (keys[37] || keys[65]) {       
        //Hastigheten får ej överskrida player.speed        
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    player.velX *= friction;//Sakta ned spelaren om 
    player.velY += gravity;//Tryck ner spelaren
 
    
  
}

//Funktion för att skjuta skott
function shootingComponent(){
    //Är musknappen nedtryckt och laddar inte om
    if(mouse.down && weapons[0].reloading>=weapons[0].reloadTime){
        weapons[0].reloading=0;//Återställ omladdningstid
        
        var velX;
        var velY;

        //Special case om musen är precis ovanför eller under spelarcentrum då trigonometriska funktioner fuckar
        if((player.x+(player.width/2))==mouse.x){
            //Skjuta uppåt eller nedåt
            if(mouse.y<(player.y+(player.height/2))){
                velY=-weapons[0].projectileSpeed;
                velX=0;
            }else{
                velY=weapons[0].projectileSpeed;
                velX=0;
            }
        }
        //Om skottet inte är riktat vertikalt räkna ut hastighetsvektorer
        else{
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

        //Pusha ett nytt skottobjekt in i playerBullets med de värden vi precis räknat ut
        playerBullets.push({
            x:player.x+(player.width/2),
            y:player.y+(player.height/2),
            width:4,
            height:4,
            velX:velX,
            velY:velY
        });
    }

    //Timer för omladdning progressar
    weapons[0].reloading++;
}

/*Stjärtfunktion för rörelser hos fienden - INTE KLART KOLLA INTE. TOP SECRET. FOR NIGGER EYES ONLY

Tanken är att ett passande x och y-värde ska genereras randomly som sedan fienden ska röra sig emot i en snygg rörelse.
Hastigheten under denna rörelse ska variera från låg till hög till låg. INSPIRIATION ICARUS DIVE - DOTA 2

När rörelsen är klar vänta en stund och generera ett nytt värde för att göra samma schyssta rörelse. RINSE AND REPEAT

*/
function enemyAi(){
    //Check if time for modeswitch
    //if(enemy.mode==1)
    if(enemy.mode==0){
        while(enemy.modeVar.targetX==null || enemy.modeVar.targetY==null || Math.sqrt((Math.pow(enemy.x-enemy.modeVar.targetX,2)+Math.pow(enemy.y-enemy.modeVar.targetY,2)))<100){
            enemy.modeVar.targetX=Math.floor((Math.random()*640));
            enemy.modeVar.targetY=Math.floor((Math.random()*200));
            if(enemy.x<enemy.modeVar.targetX){
                enemy.modeVar.graphX=enemy.modeVar.targetX-enemy.x;
                if(enemy.y<enemy.modeVar.targetY){
                    enemy.modeVar.graphY=enemy.modeVar.targetY-enemy.y;
                }else{
                    enemy.modeVar.graphY=enemy.y-enemy.modeVar.targetY;
                }
                console.log(enemy.modeVar.graphX+" "+enemy.modeVar.graphY);
                var b=Math.random()*10;
                var a=(enemy.modeVar.graphY-(b*enemy.modeVar.graphX))/Math.pow(enemy.modeVar.graphX,2);
                console.log(a+"x^2+"+b+"x");
                var tempVel=1;
                var tempCurX=0;
                var tempIntegral=tempVel+Math.sqrt(Math.pow(a*tempCurX+b,2)+1);
                var nextX=(Math.sqrt(Math.pow(tempIntegral,2)-1)-b/a);
                console.log("nextX "+nextX);
            }else{
                enemyMode.modeVar.graphX=enemy.x-enemy.modeVar.targetX;
            }
            
            
        }
        //if(enemy.x!=enemy.x)
    }
}
//Funktion för att detektera kollisioner. Fanns på stack overflow
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
//Funktion för att rendera bilden
function render() {
    requestAnimFrame(render);//Kör denna funktion kontinuerligt d.v.s. render()
    playerMovement(); //Funktion för att hantera knappnedtryck och hastigheter hos spelaren
    shootingComponent(); //Funktion som tar hand om skjutandet
    enemyAi(); //Fiende-AI inte färdigt
    ctx.clearRect(0,0,width,height);//Tömmer canvas. Tar bort grejs som redan ritats ut
    
    //Rita ut skott
    ctx.fillStyle="orange";//Färg på skotten är orange
    ctx.beginPath();//Säger till ctx att börja rita

    //Loopa igenom alla skott-objekt som finns i playerBulletsArrayen
    for(var i=0;i<playerBullets.length;i++){

        //Om ett skott åker utanför canvas förstör den
        if(playerBullets[i].x<0 || playerBullets[i].x>width || playerBullets[i].y<0 || playerBullets[i].y>height){
            playerBullets.splice(i,1);
        }
        //Om skottet kolliderar med en fiende. bulletCollision() hittades på stackoverflow
        else if(bulletCollision(playerBullets[i],enemy) && enemy.hp>0){
            playerBullets.splice(i,1);
            enemy.hp-=5;//recka hp på fiende minus 5
            console.log(enemy.hp);
        }
        //Annars rita ut skottet
        else{
            ctx.rect(playerBullets[i].x, playerBullets[i].y, playerBullets[i].width, playerBullets[i].height);//Rita en rektangel som är skottet
            //Ändra position på skottobjektet med velX pixlar/bildruta
            playerBullets[i].x+=playerBullets[i].velX;
            playerBullets[i].y+=playerBullets[i].velY;
        }
    }
    ctx.fill();//Rita ut skottet

    //Rita ut plattformar samt kolla efter kollisioner mellan spelare och plattform
    ctx.fillStyle="#000";//Svarta inferior race-plattformar
    ctx.beginPath();
    player.grounded=false;//Sätt denna variabel till falskt för att kolla ifall spelaren kan falla
    //Loopa igenom boxes-arrayen
    for(var i=0;i<boxes.length;i++){
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);//Rita ut plattformen
        
        var dir = collisionCheck(player, boxes[i]);//Kollisionsdetekteringsfunktion hittades på stack overflow. collisionCheck returner från vilken sida det kollideras. 
        //dir används för att stoppa spelaren i x/y-led beroende på dir
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
    //Om spelaren är på marken/plattform stanna i y-led
    if(player.grounded){
         player.velY = 0;
    }
    //Flytta spelaren i x- och y-led
    player.x += player.velX;
    player.y += player.velY;
    
    ctx.fill();

    //Rita ut en fiende om HP är större än 0
    if(enemy.hp>0){
        ctx.fillStyle="red";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
    
    //Rita ut spelaren
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function init(){
    canvas=document.getElementById("canvas");   //Canvas får ett värde av DOM elementet canvas
    ctx=canvas.getContext("2d"); //Variabel för att rita 2d
    canvas.width=width;
    canvas.height=height;

    //Event då en knapp trycks ner. Typ en if-sats fast bättre :). e.keyCode ger siffervärdet på knappen
    document.body.addEventListener("keydown", function(e) {
        keys[e.keyCode] = true;//Knappvariabel är true när en knapp är nere
    });
    //Same ting ass above
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });
    //När en musknapp trycks ner
    canvas.onmousedown=function(e){
        var e = e || window.event;//Cross-browser kompitabilitet. window.event är för IE
        //Om e.button är 0 --> vänster musknapp
        if ('object' === typeof e && e.button==0){ 
            mouse.x=e.clientX-canvas.getBoundingClientRect().left;//Räkna ut var klickerino hände X-värde. getBoundingClient ger avståndet mellan canvas och kanten
            mouse.y=e.clientY-canvas.getBoundingClientRect().top;//Räkna ut var klickerino hände Y-värde
            mouse.down=true; //Kom ihåg att knappen är nedtryckt för senare skottfunktioner
        }
    };
    //När musknapp släpps blir mouse.down false
    canvas.onmouseup=function(e){
        var e = e || window.event;
        if ('object' === typeof e && e.button==0){
            mouse.down=false;
        }
    };
    //Flyttas musen lagra värdet på den nya positionen
    canvas.onmousemove=function(e){
        var e = e || window.event;
        if ('object' === typeof e && e.button==0){
            mouse.x=e.clientX-canvas.getBoundingClientRect().left;
            mouse.y=e.clientY-canvas.getBoundingClientRect().top;
        }
    };
    
    render();//Börja rendera
}

