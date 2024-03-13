import * as constants from './Constants.js';
import { Population } from './NeatJS/population.js';

export class Game {
    constructor() {
        this.ballPosition = { x: constants.WIN_WIDTH / 2, y: constants.WIN_HEIGHT / 2 };
        this.ballVelocity = { x: constants.BALL_SPEED, y: 0 }; 
        this.player1Position = { x: 10, y: constants.WIN_HEIGHT / 2 - constants.PADDLE_HEIGHT / 2 };
        this.player2Position = { x: constants.WIN_WIDTH - constants.PADDLE_WIDTH - 10, y: constants.WIN_HEIGHT / 2 - constants.PADDLE_HEIGHT / 2 }
        this.hits = 0;
        this.score = 0;
        this.malus = 0;
        this.frameCount = 0;
    }

    handle_ball_collision() {
        if (this.ballPosition.y + constants.BALL_RADIUS > constants.WIN_HEIGHT) {
            this.ballPosition.y = constants.WIN_HEIGHT - constants.BALL_RADIUS;
            this.ballVelocity.y *= -1;
        }
        if (this.ballPosition.y - constants.BALL_RADIUS < 0) {
            this.ballPosition.y = constants.BALL_RADIUS;
            this.ballVelocity.y *= -1;
        }
        if (this.ballVelocity.x < 0) {
            if (this.ballPosition.y >= this.player1Position.y && this.ballPosition.y <= this.player1Position.y + constants.PADDLE_HEIGHT &&
                this.ballPosition.x - constants.BALL_RADIUS <= this.player1Position.x + constants.PADDLE_WIDTH) {
                this.ballVelocity.x *= -1;
                let hitSpot = this.ballPosition.y - (this.player1Position.y + constants.PADDLE_HEIGHT / 2);
                this.ballVelocity.y = hitSpot * 0.1;
            }
        } else {
            if (this.ballPosition.y >= this.player2Position.y && this.ballPosition.y <= this.player2Position.y + constants.PADDLE_HEIGHT &&
                this.ballPosition.x + constants.BALL_RADIUS >= this.player2Position.x) {
                this.ballVelocity.x *= -1;
                let hitSpot = this.ballPosition.y - (this.player2Position.y + constants.PADDLE_HEIGHT / 2);
                this.ballVelocity.y = hitSpot * 0.1;
                this.hits++
            }
        }
    }
    
    getCurrentState() {
        const ballPositionY = this.ballPosition.y;
        const AiPaddlePositionY = this.player2Position.y;
        const distanceFromAiPaddle = ballPositionY - this.player2Position.y;
    
        const currentState = [
            ballPositionY, 
            AiPaddlePositionY, distanceFromAiPaddle
        ];
        return currentState;
    }

    movePlayer(up, player, fitness) {
        if (!up)
        {
            if ((player.y + constants.PADDLE_HEIGHT) < constants.WIN_HEIGHT)
                player.y += 1;
            else
                this.malus += 0.08;
        }
        else
        {
            if (player.y > 0)
                player.y -= 1;
            else
                this.malus += 0.08;
        }
    }

    simulateEpisode(playerMove = 0, fitness) {
            if (Math.random() < 0.09 && this.player2Position.y + constants.PADDLE_HEIGHT < constants.WIN_HEIGHT){
                this.player1Position.y = this.ballPosition.y - constants.PADDLE_HEIGHT / 2;;
            } else if(this.player2Position.y > 0){
                this.player1Position.y = this.ballPosition.y - constants.PADDLE_HEIGHT / 2;;
            }
            switch(playerMove) {
                case 0:
                    this.movePlayer(true, this.player2Position, fitness);
                    break;
                case 1:
                    this.movePlayer(false, this.player2Position, fitness);
                    break;
                default:
                    console.error("Action non reconnue pour le joueur 2");
            }
            this.ballPosition.x += this.ballVelocity.x
            this.ballPosition.y += this.ballVelocity.y
            this.handle_ball_collision();
            if (this.ballPosition.x < 0 || this.ballPosition.x > constants.WIN_WIDTH) {
                if (this.ballPosition.x < 0) {
                    this.score += 1;
                }
                else {
                    this.score -= 1;
                    this.malus += 1;
                }
                this.ballPosition.x = constants.WIN_WIDTH / 2;
                this.ballPosition.y = constants.WIN_HEIGHT / 2;
                this.ballVelocity.x = -constants.BALL_SPEED
                this.ballVelocity.y = 0
                
            }
            this.frameCount++;
        }
    }

export var population = new Population(150);

export async function train() {
    console.log("Début de l'entraînement...");
    for (let i = 0; i < constants.TRAINING_SESSIONS; i++) {
        while (!population.done()){
            population.updateAI();
        }
        population.naturalSelection();
    }
    return population.bestPlayer;
}
