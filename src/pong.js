import * as constants from '../src/Constants.js';
import { train } from '../src/train.js';

const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let player1Position = { x: 10, y: constants.WIN_HEIGHT / 2 - constants.PADDLE_HEIGHT / 2 };
let player2Position = { x: constants.WIN_WIDTH - constants.PADDLE_WIDTH - 10, y: constants.WIN_HEIGHT / 2 - constants.PADDLE_HEIGHT / 2 };
let ballPosition = { x: constants.WIN_WIDTH / 2, y: constants.WIN_HEIGHT / 2 };
let ballVelocity = { x: constants.BALL_SPEED, y: 0};
let movingUpP1 = false;
let movingDownP1 = false;
let scorePlayer1 = 0;
let scorePlayer2 = 0;


var aiPong;
async function initAndUseAI() {
    aiPong = await train();
    draw();
}

initAndUseAI();
function drawPaddle(x, y) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, constants.PADDLE_WIDTH, constants.PADDLE_HEIGHT);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballPosition.x, ballPosition.y, constants.BALL_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
}

function handle_ball_collision() {
    if (ballPosition.y + constants.BALL_RADIUS > constants.WIN_HEIGHT) {
        ballPosition.y = constants.WIN_HEIGHT - constants.BALL_RADIUS;
        ballVelocity.y *= -1;
    }
    if (ballPosition.y - constants.BALL_RADIUS < 0) {
        ballPosition.y = constants.BALL_RADIUS;
        ballVelocity.y *= -1;
    }
	if (ballVelocity.x < 0) {
        if (ballPosition.y >= player1Position.y && ballPosition.y <= player1Position.y + constants.PADDLE_HEIGHT &&
            ballPosition.x - constants.BALL_RADIUS <= player1Position.x + constants.PADDLE_WIDTH) {
            ballVelocity.x *= -1;
            let hitSpot = ballPosition.y - (player1Position.y + constants.PADDLE_HEIGHT / 2);
            ballVelocity.y = hitSpot * 0.1;
        }
    } else {
        if (ballPosition.y >= player2Position.y && ballPosition.y <= player2Position.y + constants.PADDLE_HEIGHT &&
            ballPosition.x + constants.BALL_RADIUS >= player2Position.x) {
            ballVelocity.x *= -1;
            let hitSpot = ballPosition.y - (player2Position.y + constants.PADDLE_HEIGHT / 2);
            ballVelocity.y = hitSpot * 0.1;
        }
    }
}

function drawCourt() {
    ctx.strokeStyle = 'black'; 
    ctx.lineWidth = 2; 
    ctx.strokeRect(0, 0, constants.WIN_WIDTH, constants.WIN_HEIGHT); 
}

function drawMiddleLine() {
    const numLines = 20;
    const lineSpacing = constants.WIN_HEIGHT / numLines;
    const lineHeight = lineSpacing / 2;
    ctx.fillStyle = 'black'; 
    
    for (let i = 0; i < numLines; i++) {
        if (i % 2 === 0) { 
            ctx.fillRect(constants.WIN_WIDTH / 2 - 1, i * lineSpacing, 2, lineHeight);
        }
    }
}

function drawScore() {
    ctx.fillStyle = 'red';
    ctx.font = '30px Arial';
    ctx.fillText(scorePlayer1, constants.WIN_WIDTH / 2 - 50, 50);
    ctx.fillText(scorePlayer2, constants.WIN_WIDTH / 2 + 25, 50);
}

function draw() {
    ctx.clearRect(0, 0, constants.WIN_WIDTH, constants.WIN_HEIGHT);

    updatePaddlePosition();
    drawCourt();
    drawMiddleLine()
    drawPaddle(player1Position.x, player1Position.y); 
    drawPaddle(player2Position.x, player2Position.y);
    drawBall();
    drawScore();

    ballPosition.x += ballVelocity.x;
    ballPosition.y += ballVelocity.y;

    handle_ball_collision();
    if (ballPosition.x < 0 || ballPosition.x > constants.WIN_WIDTH){
        if (ballPosition.x < 0) {
            scorePlayer2 += 1;
        } else {
            scorePlayer1++;
        }
        ballPosition.x = constants.WIN_WIDTH / 2;
        ballPosition.y = constants.WIN_HEIGHT / 2;
        ballVelocity.x = -ballVelocity.x;
        ballVelocity.y = 0;
    }
    requestAnimationFrame(draw);
}

function getCurrentState() {
    const ballPositionY = ballPosition.y;
    const AiPaddlePositionY = player2Position.y;
    const distanceFromAiPaddle = ballPositionY - player2Position.y;

    const currentState = [
        ballPositionY, 
        AiPaddlePositionY, distanceFromAiPaddle
    ];
    return currentState;
}

function updatePaddlePosition() {
    const currentState = getCurrentState();
    aiPong.setInputs(currentState);
    aiPong.think();
    let decisionIndex = aiPong.decisions.indexOf(Math.max(...aiPong.decisions));
    if (movingUpP1 && player1Position.y > 0) {
        player1Position.y -= constants.PLAYER_SPEED;
    }
    if (movingDownP1 && player1Position.y + constants.PADDLE_HEIGHT < constants.WIN_HEIGHT) {
        player1Position.y += constants.PLAYER_SPEED;
    }
    switch (decisionIndex) {
        case 0:
            if (player2Position.y > 0) {
                player2Position.y -= constants.PLAYER_SPEED;
            }
            break;
        case 1:
            if (player2Position.y + constants.PADDLE_HEIGHT < constants.WIN_HEIGHT) {
                player2Position.y += constants.PLAYER_SPEED;
            }
            break;
    }
}

document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'z':
        case 'Z':
            movingUpP1 = true;
            break;
        case 's':
        case 'S':
            movingDownP1 = true;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch(event.key) {
        case 'z': 
        case 'Z': 
            movingUpP1 = false;
            break;
        case 's': 
        case 'S': 
            movingDownP1 = false;
            break;
    }
});