# NEAT AI for Pong Game

This project implements an AI trained using a NeuroEvolution of Augmenting Topologies (NEAT) genetic algorithm to play the classic Pong game. The AI is developed in Node.js, utilizing a NEAT library adapted specifically for this project.

## About NEAT

NEAT is an evolutionary algorithm that creates artificial neural networks. It starts with simple networks and evolves them over time, adding new nodes and connections through mutations, to solve problems or perform tasks more efficiently. In the context of this project, NEAT is used to train an AI to play Pong by evolving decision-making processes that determine paddle movements based on the game's state.

## Project Structure

The project is structured as follows:

- `neatjs/`: Contains the adapted NEAT library.
- `src/`: Source files for the Pong game and AI integration.
- `index.html`: Entry point for the game interface.
- `README.md`: This file, explaining the project setup and instructions.

## Getting Started

To run this project locally, follow these steps:

### Prerequisites

- Ensure you have Node.js installed on your system. You can download it from [Node.js official website](https://nodejs.org/).
- Install `http-server` or any similar local server tool globally using npm:
  ```sh
  npm install -g http-server
  ```
## Launching the Project

To get the project up and running on your local machine, follow these steps:

1. **Clone the project repository**:
   ```sh
   git clone <repository-url>
   ```
Replace `<repository-url>` with the actual URL of your project repository.

**Navigate into the project directory:**

```sh
cd path/to/project
```
Change `path/to/project` to the actual path where your project is located.

**Start a local server in the project directory.** If you're using `http-server`, you can run:
```sh
http-server
```
This command starts a local web server. Open your browser and navigate to the URL provided by the server (usually `http://localhost:8080`). 
This will open the game in your web browser, allowing you to see the AI in action after its training period.

## Training the AI

Once the project is running, the AI will begin training over 10 generations. This process is automated, and progress can be observed directly in the game interface. After the training phase, the AI will control the right paddle, and the game will start.

## Playing the Game

You can control the left paddle using the `Z` key to move it up and the `S` key to move it down. The right paddle is controlled by the trained AI.

## Acknowledgments
Special thanks to the creators of the original NEAT library adapted for this project.
