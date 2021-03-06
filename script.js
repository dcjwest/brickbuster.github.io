$(function(){
	//Canvas Variables
	var canvas = $('#myCanvas')[0];
	var canvasMsg = $('#msg');
	var replayBtn = $('#replay');
	var ctx = canvas.getContext('2d');
	var timer;
	var timer_ON = false;
	var score = 0;
	var lives = 2;
	var manDown = false;
	var gameOver = false;
	//Ball variables
	var ballSpeed = 2;
	var ball_dx = ballSpeed;
	var ball_dy = -ballSpeed;
	var ballCollision = false;
	var ballColour = "#00FF00";
	var coloursArr = ["#000000", "#FF0009", "#FF3300", "#FFFF00", "#00FF00", "#0560FF", "#6600FF", "#FF0066", "#FFFFFF"];
	//User input variables
	var rightPressed = false;
	var leftPressed = false;
	//Touch variables
	var touchObj = null;
	var touchStartX = 0;
	//Brick variables
	var brickRows = 3;
	var brickColumns = 8;
	var brickArr = [];

	//Initialise canvas variables
	function initCanvasVars(){
		brickWidth = 0.1*canvas.width;
		brickHeight = 0.045*canvas.height;
		brickPadding = 0.012*canvas.width;
		brickTopOffset = 0.09*canvas.height;
		brickLeftOffset = 0.06*canvas.width;
		paddleHeight = 0.03*canvas.height;
		paddleWidth = 0.15*canvas.width;
		paddle_X = (canvas.width - paddleWidth)/2;
		ballRadius = 0.9*paddleHeight;
		ball_X = (canvas.width)/2;
		ball_Y = (canvas.height)-3*paddleHeight;
	}

	//Screen-responsive canvas
	function resizeCanvas(){
		var width = (window.innerWidth > window.innerHeight)? window.innerWidth : window.innerHeight;
		var height = (window.innerWidth < window.innerHeight)? window.innerWidth : window.innerHeight;
		canvas.width = 0.85*width;
		canvas.height = 0.75*height;
		initCanvasVars();
	}

	function switchDims(){
		var temp = canvas.width;
		canvas.width = canvas.height;
		canvas.height = temp;
	}

	//Event Listeners
	window.addEventListener("resize", resizeCanvas, false);
	window.addEventListener("orientationchange", switchDims, false);
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	document.addEventListener("mousemove", mouseHandler, false);
	canvas.addEventListener("click", togglePause, false);
	canvas.addEventListener("touchstart", detectTouch);
	canvas.addEventListener("touchmove", touchHandler);

	//Initialize brick stack
	for(var c = 0; c < brickColumns; c++){
		brickArr[c] = [];
		for(var r = 0; r < brickRows; r++){
			brickArr[c][r] = {x:0, y:0, status:1};
		}
	}

	//Adjust canvas to viewport and draw the initial layout. Game is triggered by clicking on the canvas
	resizeCanvas();
	draw();

	//Event handlers for controlling paddle movement
	function keyDownHandler(event){
		if(event.which == 80 || event.which == 13){
			togglePause();
		}
		if(event.which == 39){
			rightPressed = true;
		}
		else if(event.which == 37){
			leftPressed = true;
		}
	}

	function keyUpHandler(event){
		if(event.which == 39){
			rightPressed = false;
		}
		else if(event.which == 37){
			leftPressed = false;
		}
	}

	function mouseHandler(event){
		var relativeX = event.clientX - canvas.offsetLeft;
		if(relativeX > 0 && relativeX < canvas.width){
			paddle_X = relativeX - paddleWidth;
		}
	}

	function detectTouch(event){
		touchObj = event.changedTouches[0];
		touchStartX = parseInt(touchObj.clientX);
	}

	function touchHandler(event){
		touchObj = event.changedTouches[0];
		var relativeX = parseInt(touchObj.clientX);
		if(relativeX > 0 && relativeX < canvas.width){
			paddle_X = relativeX - paddleWidth;
		}
	}

	function togglePause(){
		if(!gameOver){
			if(timer_ON){
				timer_ON = false;
				clearInterval(timer);
				if(manDown){
					canvasMsg.html('Click/Tap to try again').show();
				}
				else {
					canvasMsg.html('Game Paused (P)').show();
				}
			}
			else{
				canvasMsg.hide();
				timer_ON = true;
				timer = setInterval(draw, 10);
			}
		}
	}

	function detectCollision(){
		for(var c = 0; c < brickColumns; c++){
			for(var r = 0; r < brickRows; r++){
				var b = brickArr[c][r];

				if(b.status == 1){
					if(ball_X >= b.x && ball_X <= b.x + brickWidth 
						&& ball_Y >= b.y-ballRadius && ball_Y <= b.y + brickHeight + ballRadius){
						b.status = 0;
						ball_dy = -ball_dy;
						ballCollision = true;
						score++;

						if(score == brickRows*brickColumns){
							clearInterval(timer);
							canvasMsg.addClass('animate').html('YOU WIN! CONGRATULATIONS!').show();
							replayBtn.show();
							replayBtn.on('click', restartGame);
						}
					}
				}
			}
		}
	}

	function drawBall(){
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		if(ballCollision){
			var newColour = colourBall();
			ctx.fillStyle = newColour;
			ctx.beginPath();
			ctx.arc(ball_X, ball_Y, ballRadius, 0, Math.PI*2);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ballCollision = false;
			ballColour = newColour;
		}

		else{
			ctx.beginPath();
			ctx.arc(ball_X, ball_Y, ballRadius, 0, Math.PI*2);
			ctx.fillStyle = ballColour;
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
			ballCollision = false;
		}
	}

	//Change ball colour every time it hits a brick
	function colourBall(){
		var randNum = Math.floor(Math.random()*8+1);
		var nextColour = coloursArr[randNum]
		return ballColour === nextColour? coloursArr[0] : nextColour;
	}

	function drawPaddle(){
		ctx.beginPath();
		ctx.rect(paddle_X, canvas.height-(2*paddleHeight), paddleWidth, paddleHeight);
		ctx.fillStyle = "#333";
		ctx.fill();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.closePath();
	}

	function drawBricks(){
		for(var c = 0; c < brickColumns; c++){
			for(var r = 0; r < brickRows; r++){
				if(brickArr[c][r].status == 1){
					var brickX = (c*(brickWidth + brickPadding)) + brickLeftOffset;
					var brickY = (r*(brickHeight + brickPadding)) + brickTopOffset;
					brickArr[c][r].x = brickX;
					brickArr[c][r].y = brickY;
					ctx.beginPath();
					ctx.rect(brickX, brickY, brickWidth, brickHeight);
					ctx.fillStyle = "#9F0000";
					ctx.fill();
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 2;
					ctx.stroke();
					ctx.closePath();
				}
			}
		}
	}

	function drawScore(){
		ctx.font = "18px Impact";
		ctx.fillStyle = "black";
		ctx.fillText("Score: "+score, 10, 20);
	}

	function drawLives(){
		ctx.font = "18px Impact";
		ctx.fillStyle = "black";
		ctx.fillText("Lives: "+lives, canvas.width - 65, 20);
	}

	function draw(){
		if (manDown){
			togglePause();
			manDown = false;
			ball_dy = -ballSpeed;
		}
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//Draw canvas components
		drawBricks();
		drawBall();
		drawPaddle();
		drawScore();
		drawLives();
		//Handle brick-collision detection
		detectCollision();
		//Collision with either right or left wall
		if(ball_X + ball_dx > canvas.width - ballRadius || ball_X + ball_dx < ballRadius){
			ball_dx = -ball_dx;
		}
		//Collision with ceiling
		if(ball_Y + ball_dy < ballRadius){
			ball_dy = -ball_dy;
		}
		//Collision with paddle
		if(ball_Y > canvas.height - (paddleHeight + 2*ballRadius)){
			if(ball_X > paddle_X && ball_X < paddle_X + paddleWidth){
				ball_dy = -ball_dy;
			}
		}
		//Ball falls out of bounds
		if(ball_Y > canvas.height + ballRadius){
			lives--;
			if(lives < 0){
				gameOver = true;
				clearInterval(timer);
				canvasMsg.addClass('animate').html('GAME OVER!').show();
				replayBtn.show();
				replayBtn.on('click', restartGame);
			}
			else{
				manDown = true;
				ball_dy = -ballSpeed;
				ball_X = (canvas.width)/2;
				ball_Y = (canvas.height)-3*paddleHeight;
				paddle_X = (canvas.width - paddleWidth)/2;
			}
		}
		//Control paddle movement within canvas
		if(rightPressed && paddle_X < canvas.width-paddleWidth){
			paddle_X += 7;
		}
		else if (leftPressed && paddle_X > 0){
			paddle_X -= 7;
		}
		//Increment ball position coordinates i.e. make ball move
		ball_X += ball_dx;
		ball_Y += ball_dy;
	}

	function restartGame(){
		replayBtn.hide();
		canvasMsg.removeClass('animate');

		for(var c = 0; c < brickColumns; c++){
			brickArr[c] = [];
			for(var r = 0; r < brickRows; r++){
				brickArr[c][r] = {x:0, y:0, status:1};
			}
		}

		initCanvasVars();
		gameOver = false;
		manDown = true;
		lives = 2;
		score = 0;
		draw();
	}
});
