export const PADDLE_WIDTH = 20;
export const PADDLE_HEIGHT = 80;

export const TRAINING_SESSIONS = 5;
export const BALL_RADIUS = 8;
export const BALL_SPEED = 10;
export const PLAYER_SPEED = 7;

export const WIN_WIDTH = 800;
export const WIN_HEIGHT = 600;

export const GAME_AREA_WIDTH = 70;
export const GAME_AREA_HEIGHT = 50;

export const WINNING_SCORE = 5;

export const canvas = document.getElementById('pongCanvas');
canvas.width = WIN_WIDTH;
canvas.height = WIN_HEIGHT;
export const ctx = canvas.getContext('2d');