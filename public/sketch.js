var socket;

var bullets;
var enemyBullets;
var move = 0;
var screen = 0;

var canvasX = 1300;
var canvasY = 600;


function setup() {
    createCanvas(canvasX, canvasY);


    //connects to server.js
    socket = io.connect('http://' + location.host);

    //executes functions when recieves information from server
    socket.on('tankLoc', enemyTankLoc);
    socket.on('bulletLoc', enemyBulletLoc);

    //images for sprites
    tank1img = loadImage("assets/tank1.png");
    tank2img = loadImage("assets/tank2.png");
    bulletimg = loadImage("assets/bullet.png");

    //initialize user's tank at random position
    tankSprite = createSprite(random(50, canvasX - 50), random(50, canvasY - 50));
    tankSprite.addImage(tank2img);
    tankSprite.health = 100;
    tankSprite.mass = 200;
    tankSprite.dir = " ";
    tankSprite.scale = .75;

    //initializes enemy tank offscreen until enemy connects
    enemySprite = createSprite(-200, -200);
    enemySprite.addImage(tank1img);
    enemySprite.health = 100;
    enemySprite.mass = 200;
    enemySprite.scale = .75;

    //adds player bullets and enemy bullets to their own sprite groups
    bullets = new Group();
    enemyBullets = new Group();
}


function draw() {
    background(1, 142, 14);


    //--------------------
    //Start screen, once button is clicked screen++ and game starts
    if (screen === 0) {

        //draws enemies to see their location
        drawSprite(enemySprite);

        //transparent layer for start screen
        fill(200, 200, 200, 100);
        rect(0, 0, canvasX, canvasY);


        //start button
        fill(200);
        rect(canvasX / 2 - 125, canvasY / 2 + 100, 250, 125, 10);
        fill(0);
        textSize(100);
        text("Start", canvasX / 2 - 110, canvasY / 2 + 200);

        //button pressed next screen / game starts
        if (mouseIsPressed && mouseX > canvasX / 2 - 125 && mouseX < canvasX / 2 + 125 &&
            mouseY > canvasY / 2 + 100 && mouseY < canvasY / 2 + 225) {
            screen++;
        }
    }

    //---------------------------
    //main game initialized after start > 0
    if (screen === 1) {

        //function updates tank movement based on user input
        tankMovement();
        //function creates
        tankData();


        //player takes damage
        if (enemyBullets.overlap(tankSprite, function (bullet) {
                tankSprite.health -= 5;

                bullet.remove();
            }));

        //enemy takes damage
        if (bullets.overlap(enemySprite, function (bullet) {
                enemySprite.health -= 5;

                bullet.remove();
            }));

        //tank collision causes both tanks take damage
        if (tankSprite.overlap(enemySprite, function () {
                tankSprite.health -= .5
                enemySprite.health -= .5;
            }));

        //collision on tanks
        tankSprite.collide(enemySprite, function (spriteA, spriteB) {});



        //player health bar  
        fill(255, 0, 0);
        rect(tankSprite.position.x - 50, tankSprite.position.y - 50, 100, 10);
        fill(0, 255, 0);
        rect(tankSprite.position.x - 50, tankSprite.position.y - 50, tankSprite.health, 10);

        //enemy health bar
        fill(255, 0, 0);
        rect(enemySprite.position.x - 50, enemySprite.position.y - 50, 100, 10);
        fill(0, 255, 0);
        rect(enemySprite.position.x - 50, enemySprite.position.y - 50, enemySprite.health, 10);

        //if player or enemies tank destroyed, next screen
        if (tankSprite.health < .1 || enemySprite.health < .1) {
            screen++;
        }

        drawSprites();
    }

    //--------------------------------------
    //End screen after player or enemy tank destroyed
    if (screen === 2) {
        




        //lose
        if (tankSprite.health < .1) {
            fill(200, 200, 200, 100);
            rect(0, 0, canvasX, canvasY);


            fill(0);
            textSize(100);
            textAlign(CENTER);
            text("YOU LOSE", canvasX / 2, canvasY / 2);
            drawSprite(enemySprite);
        }

        //win
        else if (enemySprite.health < .1) {
            fill(200, 200, 200, 100);
            rect(0, 0, canvasX, canvasY);


            fill(0);
            textSize(100);
            textAlign(CENTER);
            text("YOU WIN", canvasX / 2, canvasY / 2);
            drawSprite(enemySprite);
        }

        //play again button
        fill(200);
        rect(canvasX / 2 - 162, canvasY / 2 + 150, 325, 100, 10);
        fill(0);
        textSize(50);
        text("Play Again?", canvasX / 2, canvasY / 2 + 225);
        
        


        if (mouseIsPressed && mouseX > canvasX / 2 - 162 && mouseX < canvasX / 2 + 162 &&
            mouseY > canvasY / 2 + 150 && mouseY < canvasY / 2 + 250) {
            screen = 1;

            tankSprite.health = 100;
            tankSprite.position.x = random(50, canvasX - 50);
            tankSprite.position.y = random(50, canvasY - 50);

            enemySprite.health = 100;
            enemySprite.position.x = -200;
            enemySprite.position.y = -200;
            drawSprite(enemySprite);
            
        }
    }


}


//data passed from enemy client, provides X,Y location and direction
function enemyTankLoc(tankLocData) {

    enemySprite.position.x = tankLocData.x;
    enemySprite.position.y = tankLocData.y;
    enemySprite.dir = tankLocData.dir;

    //heal
    if (enemySprite.dir == "r" && enemySprite.health < 100) {
        enemySprite.health += .25;
        enemySprite.setSpeed(0, 0);

        //rotation and speed
    } else if (enemySprite.dir == "w") {
        enemySprite.rotation = 0;
    } else if (enemySprite.dir == "a") {
        enemySprite.rotation = 270;
    } else if (enemySprite.dir == "s") {
        enemySprite.rotation = 180;
    } else if (enemySprite.dir == "d") {
        enemySprite.rotation = 90;
    } else {
        enemySprite.setSpeed(0, 0);
    }
}

//enemy client provided bullet data
function enemyBulletLoc(bulletData) {

    //creates enemy bullets and pushes them into the enemyBullet group
    var enemyBullet = createSprite(bulletData.x, bulletData.y);
    enemyBullet.addImage(bulletimg);
    enemyBullet.scale = bulletData.scale;
    enemyBullet.setSpeed(bulletData.speed, bulletData.speedrot);
    enemyBullet.rotation = bulletData.speedrot;
    enemyBullet.life = bulletData.life
    enemyBullets.add(enemyBullet);

}



//records player tank location data and sends to server
function tankData() {
    if (keyDown("w") || keyDown("a") || keyDown("s") || keyDown("d") || keyDown("r") || mouseIsPressed) {

        var tankLoc = {
            x: tankSprite.position.x,
            y: tankSprite.position.y,
            dir: tankSprite.dir
        }
        socket.emit('tankLoc', tankLoc);
    }
}

//clicking creates a new bullet when in the main game screen
function mousePressed() {
    if (screen > 0) {
        new Bullet(tankSprite.position.x, tankSprite.position.y);
    }
}

//bullet constructor, creates bullet from tank location, adds it to bullet group
//then passes bullet information to server
function Bullet(x, y) {
    var bullet = createSprite(tankSprite.position.x, tankSprite.position.y);
    bullet.addImage(bulletimg);
    bullet.scale = (.2);
    bullet.setSpeed(10 + tankSprite.getSpeed(), tankSprite.rotation + 270);
    bullet.speed = 10 + tankSprite.getSpeed();
    bullet.speedrot = tankSprite.rotation + 270;
    bullet.rotation = tankSprite.rotation + 270;
    bullet.life = 200;
    bullets.add(bullet);

    var bulletLoc = {
        x: x,
        y: y,
        scale: bullet.scale,
        speed: bullet.speed,
        speedrot: bullet.speedrot,
        rot: bullet.rotation,
        life: bullet.life
    }

    socket.emit('bulletLoc', bulletLoc);
}

//function updates tank direction and movement based on keyDown
function tankMovement() {
    if (keyDown("r") && tankSprite.health < 100) {
        tankSprite.health += .25;
        tankSprite.setSpeed(0, 0);
        tankSprite.dir = "r"
    } else if (keyDown("w")) {
        tankSprite.dir = "w"
        tankSprite.setSpeed(7, 270);
        tankSprite.rotation = 0;
    } else if (keyDown("a")) {
        tankSprite.dir = "a"
        tankSprite.rotation = 270;
        tankSprite.setSpeed(7, 180);
    } else if (keyDown("s")) {
        tankSprite.dir = "s"
        tankSprite.rotation = 180;
        tankSprite.setSpeed(7, 90);
    } else if (keyDown("d")) {
        tankSprite.dir = "d"
        tankSprite.rotation = 90;
        tankSprite.setSpeed(7, 0);
    } else {
        tankSprite.setSpeed(0, 0);
    }


    //keeps tank on screen
    if (tankSprite.position.x - 25 > canvasX && tankSprite.dir == "d") {
        tankSprite.position.x = -25;
    }
    if (tankSprite.position.x + 25 < 0 && tankSprite.dir == "a") {
        tankSprite.position.x = canvasX + 25;
    }
    if (tankSprite.position.y + 25 < 0 && tankSprite.dir == "w") {
        tankSprite.position.y = canvasY + 25;
    }
    if (tankSprite.position.y - 25 > canvasY && tankSprite.dir == "s") {
        tankSprite.position.y = -25;
    }
}
