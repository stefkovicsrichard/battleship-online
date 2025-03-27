// Connect to the Socket.IO server
const socket = io();

const login = document.getElementById("credentials");
const game = document.getElementById("game");
game.style = "display: none"

// Get the board container elements from the DOM
const ownBoard = document.getElementById("own_board");
const enemyBoard = document.getElementById("enemy_board");

var clicking = false;
var curClick = "";

/**
 * createBoard(container, prefix, isClickable)
 * - container: DOM element to contain the board.
 * - prefix: used for creating unique cell IDs ("own" or "enemy").
 * - isClickable: when true, attaches click events to each cell.
 */
function createBoard(container, prefix, isClickable = false) {
  	const table = document.createElement("table");
  	for (let i = 0; i < 10; i++) {
    	const tr = document.createElement("tr");
    	for (let j = 0; j < 10; j++) {
      		const td = document.createElement("td");
      		// Assign a unique ID to each cell based on its coordinates.
      		td.id = `${prefix}-cell-${i}-${j}`;

      		// If the board should respond to clicks, add a click listener.
      		if (isClickable && prefix == "own") {
				td.addEventListener("click", function () {
					// Create an object with the cell's coordinates.
					const cellCoords = { row: i, col: j };
  
					// Emit the 'clicked' event with the cell's coordinates.
					socket.emit("clicked", cellCoords);
					
					place(this);
			  	});
      		} else if (isClickable && prefix == "enemy") {
				td.addEventListener("click", function () {
					// Create an object with the cell's coordinates.
					const cellCoords = { row: i, col: j };
  
					// Emit the 'clicked' event with the cell's coordinates.
					socket.emit("clicked", cellCoords);
					
					shoot(this);
				});
			}
      		tr.appendChild(td);
	    }
    	table.appendChild(tr);
  	}
  	container.appendChild(table);
}

function join(data) {
	if (!data.username || !data.roomId) {
		alert("felhasznalonev es szoba id kotelezo ocsisajr");
	} else {
		socket.emit('joinRoom', data);
	}
}

/**
 * place(element)
 * Toggles the background color of the provided cell.
 */
function place(element) {
	const ship = document.getElementById('ship').value - 1;
	if (!clicking) {
		curClick = element;
		clicking = true;
		const dirs = [[0, 1], [-1, 0], [0, -1], [1, 0]];
		var y = element.id.split("-")[2]*1;
		var x = element.id.split("-")[3]*1;
		const cy = y;
		const cx = x;
		document.getElementById(element.id).style.backgroundColor = "green";

		for (let i = 0; i < dirs.length; i++) {
			y+=dirs[i][0];
			x+=dirs[i][1];
			while ( (!(y>=10) && !(y<0) && !(x>=10) && !(x<0)) && (!(y>cy+ship) && !(y<cy-ship) && !(x>cx+ship) && !(x<cx-ship)) ) {
				var check = document.getElementById(`own-cell-${y}-${x}`);
				if (!check.style.backgroundColor == "grey") {
					
				} else {
					y+=dirs[i][0];
					x+=dirs[i][1];
				}
				check.style.backgroundColor = "red";
			}
			y = element.id.split("-")[2]*1;
			x = element.id.split("-")[3]*1;
		}
	} else {
		if (element.style.backgroundColor == "red") {
			var y = curClick.id.split("-")[2]*1;
			var x = curClick.id.split("-")[3]*1;
			var endY = element.id.split("-")[2]*1;
			var endX = element.id.split("-")[3]*1;
			// const dir = [y/endY==NaN?0:y/endY, x/endX==NaN?0:x/endX]
			var dir = [];
			var yN = (y-endY)/(y-endY) || 0;
			var yNH = y-endY<0?1:-1;
			var xN = (x-endX)/(x-endX) || 0;
			var xNH = x-endX<0?1:-1;
			yN = yN*yNH;
			xN = xN*xNH;
			if (yN > 0 && xN == 0) { 
				dir.push(1);
				dir.push(0);
			}
			if (yN == 0 && xN < 0) {
				dir.push(0);
				dir.push(-1);
			}
			if (yN < 0 && xN == 0) {
				dir.push(-1);
				dir.push(0);
			}
			if (yN == 0 && xN > 0) {
				dir.push(0);
				dir.push(1);
			}
			document.getElementById(`own-cell-${y}-${x}`).style.backgroundColor = "blue";
			do {
				y+=dir[0];
				x+=dir[1];
				document.getElementById(`own-cell-${y}-${x}`).style.backgroundColor = "blue";
			} while (y!=endY||x!=endX);
			clicking = false;
			curClick = "";
		}
	}
	
	// const xPivot = element.id.split("-")[3]*1; //4
	// const yPivot = element.id.split("-")[2]*1; //5

	// if (!dirs.length == 0) {
	// 	if (element.style.backgroundColor == "green") {
	// 		element.style.backgroundColor = "";
	// 	} else {
	// 		element.style.backgroundColor = "green";
			
			
			
			
	// 		// for (let i = 0; i < dirs.length; i++) {
	// 		// 	const xEnd = dirs[i][1]; //4
	// 		// 	const yEnd = dirs[i][0]; //9
	// 		// 	for (let j = 0; j < ship; j++) {
	// 		// 		let xCurrent = xPivot; //4
	// 		// 		let yCurrent = yPivot; //5
	// 		// 		if (xCurrent < xEnd) {
	// 		// 			xCurrent++;
	// 		// 			let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 			x.style.backgroundColor = "red";
	// 		// 		} else if (xCurrent > xEnd) {
	// 		// 			xCurrent--;
	// 		// 			let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 			x.style.backgroundColor = "red";
	// 		// 		}
	// 		// 		if (yCurrent < yEnd) {
	// 		// 			yCurrent++;
	// 		// 			let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 			x.style.backgroundColor = "red";
	// 		// 		} else if (yCurrent > yEnd) {
	// 		// 			yCurrent--;
	// 		// 			let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 			x.style.backgroundColor = "red";
	// 		// 		}

	// 		// 		if (yCurrent == yEnd && xCurrent == xEnd) {
	// 		// 			let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 			x.style.backgroundColor = "green";
	// 		// 		}

	// 		// 		// if (yEnd < yPivot) {
	// 		// 		// 	yCurrent--;
	// 		// 		// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 		// 	x.style.backgroundColor = "red";
	// 		// 		// } else if (yEnd > yPivot) {
	// 		// 		// 	yCurrent++;
	// 		// 		// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 		// 	x.style.backgroundColor = "red";
	// 		// 		// }

	// 		// 		// if (xEnd < xPivot) {
	// 		// 		// 	xCurrent--;
	// 		// 		// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 		// 	x.style.backgroundColor = "red";
	// 		// 		// } else if (xEnd > xPivot) {
	// 		// 		// 	xCurrent++;
	// 		// 		// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 		// 	x.style.backgroundColor = "red";
	// 		// 		// }

	// 		// 		// const current = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
	// 		// 		// if (j == ship-1) {
	// 		// 		// 	current.style.backgroundColor = "green";
	// 		// 		// 	current.addEventListener("click", () => {
	// 		// 		// 		createShip(element.id, current);
	// 		// 		// 	}, { once: true });
	// 		// 		// } else {
	// 		// 		// 	current.style.backgroundColor = "red";
	// 		// 		// }
	// 		// 	}
	// 		// }
	// 	}
	// }
}


// function directions(element) {
// 	const dirs = [[0, 1], [-1, 0], [0, -1], [1, 0]];
	
	
// 	// const x = element.id.split("-")[3]*1;
// 	// const y = element.id.split("-")[2]*1;

// 	// let dirs = [];
// 	// if (y+ship<=10) dirs.push([y+ship, x]);
// 	// if (x+ship<=10) dirs.push([y, x+ship]);
// 	// if (y-ship>=1) dirs.push([y-ship, x]);
// 	// if (x-ship>=1) dirs.push([y, x-ship]);

// 	// return dirs;
// }

// Listen for the 'change' event from the server.
// When received, update the corresponding cell on the enemy board.

function toggleCell(cell, color) {
	cell.style.backgroundColor = color;
}

socket.on('change', (cellCoords, color) => {
	if (sender != socket.id) {
		const { row, col } = cellCoords;
		const cellId = `enemy-cell-${row}-${col}`;
		const targetCell = document.getElementById(cellId);
		if (targetCell) {
		  toggleCell(targetCell, color);
	}
  }
});

socket.on('joinSuccess', (data) => {
	login.style = "display: none";
		game.style = "";
		createBoard(ownBoard, "own", true);
		createBoard(enemyBoard, "enemy", false);
});

socket.on('joinFail', () => {
	alert("teli a szoba ez nem bohockocsi");
});
