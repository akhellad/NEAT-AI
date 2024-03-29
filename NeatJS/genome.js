import { Node } from './node.js';
import { Connection } from './connection.js';

//The Genome Class
//Well.. this is the main class
//This is where all the magic happens
export class Genome {
	constructor(inp, out, id, offSpring = false) {
		this.inputs = inp; //Number of inputs
		this.outputs = out; //Number of outputs
		this.layers = 2;
		this.nextNode = 0;

		this.nodes = [];
		this.connections = [];

		if(!offSpring) { //This is not an offspring genome generate a fullyConnected net
			for (let i = 0; i < this.inputs; i++) {
				this.nodes.push(new Node(this.nextNode, 0));
				this.nextNode++;
			}

			for (let i = 0; i < this.outputs; i++) {
				let node = new Node(this.nextNode, 1, true);
				this.nodes.push(node);
				this.nextNode++;
			}


			for (let i = 0; i < this.inputs; i++) {
				for (let j = this.inputs; j < this.outputs + this.inputs; j++) {
					let weight = Math.random() * this.inputs * Math.sqrt(2 / this.inputs);
					this.connections.push(new Connection(this.nodes[i], this.nodes[j], weight));
				}
			}
		}
	}

	//Network Core
	generateNetwork() {
		//Clear all outputConnections in the nodes
		this.nodes.forEach((node) => {
			node.outputConnections.splice(0, node.outputConnections.length);
		});

		//Add the connections to the Nodes
		this.connections.forEach((conn) => {
			conn.fromNode.outputConnections.push(conn);
		});

		//Prepare for feed forward
		this.sortByLayer();
	}

	feedForward(inputValues) {
		this.generateNetwork(); //Connect all up

		//Clear old inputs
		this.nodes.forEach((node) => { node.inputSum = 0; });

		//asin new inputs
		for (let i = 0; i < this.inputs; i++)
			this.nodes[i].outputValue = inputValues[i];

		//Engage all nodes and Extract the results from the outputs
		let result = [];
		this.nodes.forEach((node) => {
			node.engage();

			if (node.output)
				result.push(node.outputValue);
		});
		return result;
	}


	//Crossover
	crossover(partner) {
		//TODO: find a good way to generate unique ids
		let offSpring = new Genome(this.inputs, this.outputs, 0, true); //Child genome
		offSpring.nextNode = this.nextNode;


		//Take all nodes from this parent - output node activation 50%-50%
		for(let i = 0; i < this.nodes.length; i++){
			let node = this.nodes[i].clone();
			if(node.output) {
				let partnerNode = partner.nodes[partner.getNode(node.number)];
				if(Math.random() > 0.5) {
					node.activationFunction = partnerNode.activationFunction;
					node.bias = partnerNode.bias;
				}
			}
			offSpring.nodes.push(node);
		}

		//Randomly take connections from this or the partner network
		let maxLayer = 0;
		for(let i = 0; i < this.connections.length; i++) {
			let index = this.commonConnection(this.connections[i].getInnovationNumber(), partner.connections);

			if(index != -1) { //There is a commonConnection
				let conn = Math.random() > 0.5 ? this.connections[i].clone() : partner.connections[index].clone();

				//Reassign nodes
				let fromNode = offSpring.nodes[offSpring.getNode(conn.fromNode.number)];
				let toNode = offSpring.nodes[offSpring.getNode(conn.toNode.number)];
				conn.fromNode = fromNode;
				conn.toNode = toNode;

				//Add this connection to the child
				if(fromNode && toNode)
					offSpring.connections.push(conn);
			}
			else { //No common connection -> take from this
				let conn = this.connections[i].clone();

				//Reassign nodes
				let fromNode = offSpring.nodes[offSpring.getNode(conn.fromNode.number)];
				let toNode = offSpring.nodes[offSpring.getNode(conn.toNode.number)];
				conn.fromNode = fromNode;
				conn.toNode = toNode;

				//Add this connection to the child
				if(fromNode && toNode)
					offSpring.connections.push(conn);
			}
		}

		offSpring.layers = this.layers;
		return offSpring;
	}



	//Mutation Stuff
	mutate() {
		//console.log("Mutation...");
		let mut;

		if(Math.random() < 0.8) { //80%
			//MOD Connections
			mut = "ModConn";
			//let i = Math.floor(Math.random() * this.connections.length);
			//this.connections[i].mutateWeight();
			for (var i = 0; i < this.connections.length; i++) {
				this.connections[i].mutateWeight();
			}
		}

		if(Math.random() < 0.5) { //50%
			//MOD Bias
			mut = "ModBias";
			//let i = Math.floor(Math.random() * this.nodes.length);
			//this.nodes[i].mutateBias();
			for (var i = 0; i < this.nodes.length; i++) {
				this.nodes[i].mutateBias();
			}
		}

		if(Math.random() < 0.1) { //10%
			//MOD Node
			mut = "ModAct";
			let i = Math.floor(Math.random() * this.nodes.length);
			this.nodes[i].mutateActivation();
		}

		if(Math.random() < 0.05) { //5%
			//ADD Connections
			mut = "AddConn";
			this.addConnection();
		}

		if(Math.random() < 0.01) { //1%
			//ADD Node
			mut = "AddNode";
			this.addNode();
		}
	}

	addNode() { //Add a node to the network
		//Get a random connection to replace with a node
		let connectionIndex = Math.floor(Math.random() * this.connections.length);
		let pickedConnection = this.connections[connectionIndex];
		pickedConnection.enabled = false;
		this.connections.splice(connectionIndex, 1); //Delete the connection

		//Create the new node
		let newNode = new Node(this.nextNode, pickedConnection.fromNode.layer + 1);
		this.nodes.forEach((node) => { //Shift all nodes layer value
			if (node.layer > pickedConnection.fromNode.layer)
				node.layer++;
		});

		//New connections
		let newConnection1 = new Connection(pickedConnection.fromNode, newNode, 1);
		let newConnection2 = new Connection(newNode, pickedConnection.toNode, pickedConnection.weight);

		this.layers++;
		this.connections.push(newConnection1); //Add connection
		this.connections.push(newConnection2); //Add connection
		this.nodes.push(newNode); //Add node
		this.nextNode++;
	}

	addConnection() { //Add a connection to the network
		if (this.fullyConnected())
			return; //Cannot add connections if it's fullyConnected

		//Choose to nodes to connect
		let node1 = Math.floor(Math.random() * this.nodes.length);
		let node2 = Math.floor(Math.random() * this.nodes.length);

		//Search for two valid nodes
		while (this.nodes[node1].layer == this.nodes[node2].layer
			|| this.nodesConnected(this.nodes[node1], this.nodes[node2])) {
			node1 = Math.floor(Math.random() * this.nodes.length);
			node2 = Math.floor(Math.random() * this.nodes.length);
		}

		//Switch nodes based on their layer
		if (this.nodes[node1].layer > this.nodes[node2].layer) {
			let temp = node1;
			node1 = node2;
			node2 = temp;
		}

		//add the connection
		let newConnection = new Connection(this.nodes[node1], this.nodes[node2], Math.random() * this.inputs * Math.sqrt(2 / this.inputs));
		this.connections.push(newConnection);
	}



	//Utilities
	commonConnection(innN, connections) {
		//Search through all connections to check for
		//one with the correct Innovation Number
		for(let i = 0; i < connections.length; i++){
			if(innN == connections[i].getInnovationNumber())
				return i;
		}

		//Found nothing
		return -1;
	}

	nodesConnected(node1, node2) {
		//Search if there is a connection between node1 & node2
		for (let i = 0; i < this.connections.length; i++) {
			let conn = this.connections[i];
			if ((conn.fromNode == node1 && conn.toNode == node2)
				|| (conn.fromNode == node2 && conn.toNode == node1)) {
				return true;
			}
		};

		return false;
	}

	fullyConnected() {
		//check if the network is fully connected
		let maxConnections = 0;
		let nodesPerLayer = [];

		//Calculate all possible connections
		this.nodes.forEach((node) => {
			if (nodesPerLayer[node.layer] != undefined)
				nodesPerLayer[node.layer]++;
			else
				nodesPerLayer[node.layer] = 1;
		});

		for (let i = 0; i < this.layers - 1; i++)
			for (let j = i + 1; j < this.layers; j++)
				maxConnections += nodesPerLayer[i] * nodesPerLayer[j];

		//Compare
		return maxConnections == this.connections.length;
	}

	sortByLayer(){
		//Sort all nodes by layer
		this.nodes.sort((a, b) => {
			return a.layer - b.layer;
		});
	}

	clone() { //Returns a copy of this genome
		let clone = new Genome(this.inputs, this.outputs, this.id);
		clone.nodes = this.nodes.slice(0, this.nodes.length);
		clone.connections = this.connections.slice(0, this.connections.length);

		return clone;
	}

	getNode(x){ //Returns the index of a node with that Number
		for(let i = 0; i < this.nodes.length; i++)
			if(this.nodes[i].number == x)
				return i;

		return -1;
	}

	calculateWeight() { //Computational weight of the network
		return this.connections.length + this.nodes.length;
	}
}
