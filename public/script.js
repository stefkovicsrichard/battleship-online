// Connect to the Socket.IO server
const socket = io();

// Get the board container elements from the DOM
const ownBoard = document.getElementById("own_board");
const enemyBoard = document.getElementById("enemy_board");

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
					
					place(this, 5);
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

// Create your own board (non-clickable) and the enemy board (click-enabled).
createBoard(ownBoard, "own", true);
createBoard(enemyBoard, "enemy", false);

/**
 * place(element)
 * Toggles the background color of the provided cell.
 */
function place(element, ship) {
	const dirs = directions(element, ship-1);
	const xPivot = element.id.split("-")[3]*1; //4
	const yPivot = element.id.split("-")[2]*1; //5

	if (!dirs.length == 0) {
		if (element.style.backgroundColor == "green") {
			element.style.backgroundColor = "";
		} else {
			element.style.backgroundColor = "green";
			for (let i = 0; i < dirs.length; i++) {
				const xEnd = dirs[i][1]; //4
				const yEnd = dirs[i][0]; //9
				for (let j = 1; j < ship; j++) {
					let xCurrent = xPivot; //4
					let yCurrent = yPivot; //5

					if (xCurrent < xEnd) {
						xCurrent++;
						let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
						x.style.backgroundColor = "red";
					} else if (xCurrent > xEnd) {
						xCurrent--;
						let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
						x.style.backgroundColor = "red";
					}

					if (yCurrent < yEnd) {
						yCurrent++;
						let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
						x.style.backgroundColor = "red";
					} else if (yCurrent > yEnd) {
						yCurrent--;
						let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
						x.style.backgroundColor = "red";
					}

					if (yCurrent == yEnd && xCurrent == xEnd) {
						let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
						x.style.backgroundColor = "green";
					}

					// if (yEnd < yPivot) {
					// 	yCurrent--;
					// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
					// 	x.style.backgroundColor = "red";
					// } else if (yEnd > yPivot) {
					// 	yCurrent++;
					// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
					// 	x.style.backgroundColor = "red";
					// }

					// if (xEnd < xPivot) {
					// 	xCurrent--;
					// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
					// 	x.style.backgroundColor = "red";
					// } else if (xEnd > xPivot) {
					// 	xCurrent++;
					// 	let x = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
					// 	x.style.backgroundColor = "red";
					// }

					// const current = document.getElementById(`own-cell-${yCurrent}-${xCurrent}`);
					// if (j == ship-1) {
					// 	current.style.backgroundColor = "green";
					// 	current.addEventListener("click", () => {
					// 		createShip(element.id, current);
					// 	}, { once: true });
					// } else {
					// 	current.style.backgroundColor = "red";
					// }
				}
			}
		}
	}
}


function directions(element, ship) {
	const x = element.id.split("-")[3]*1;
	const y = element.id.split("-")[2]*1;

	let dirs = [];

	if (y+ship<=10) dirs.push([y+ship, x]);
	if (x+ship<=10) dirs.push([y, x+ship]);
	if (y-ship>=1) dirs.push([y-ship, x]);
	if (x-ship>=1) dirs.push([y, x-ship]);

	return dirs;
}

// Listen for the 'change' event from the server.
// When received, update the corresponding cell on the enemy board.
socket.on("change", (cellCoords) => {
  	const { row, col } = cellCoords;
  	const cellId = `enemy-cell-${row}-${col}`;
  	const targetCell = document.getElementById(cellId);
  	if (targetCell) {
    	toggleCellAppearance(targetCell);
  }
});
