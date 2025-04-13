const socket = io();

const login = document.getElementById("credentials");
const game = document.getElementById("game");
const waiting = document.getElementById("waiting");
var number = 0;
waiting.style = "display: none";
game.style = "display: none";

const ownBoard = document.getElementById("own_board");
const enemyBoard = document.getElementById("enemy_board");

var myTurn = false;
var placedAll = false;
var clicking = false;
var curClick = "";

const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const dships = [];
const ships = [document.getElementById("5ship"), document.getElementById("4ship"), document.getElementById("3ship"), document.getElementById("2ship1"), document.getElementById("2ship2")];

function createBoard(container, prefix) {
  	const table = document.createElement("table");
  	for (let i = 0; i < 10; i++) {
    	const tr = document.createElement("tr");
    	for (let j = 0; j < 10; j++) {
      		const td = document.createElement("td");
      		td.id = `${prefix}-cell-${i}-${j}`;
      		if (prefix == "own") {
				td.addEventListener("click", function () {
					place(this);
			  	});
      		} else if (prefix == "enemy") {
				td.addEventListener("click", function () {
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

function C(y, x, cy, cx, ship) {
	if ((!(y>9) && !(y<0) && !(x>9) && !(x<0)) && (!(y>cy+ship) && !(y<cy-ship) && !(x>cx+ship) && !(x<cx-ship)) && !(document.getElementById(`own-cell-${y}-${x}`).style.backgroundColor == 'blue')) {
		return true;
	} else {
		return false;
	}
}

function isTouching(y, x) {
	if (!isInbounds(y, x)) return false;
	else if (document.getElementById(`own-cell-${y}-${x}`).style.backgroundColor == "blue") return true;
	else return false;
}

function isInbounds(y, x) {
	if (!(y>9) && !(y<0) && !(x>9) && !(x<0)) return true;
	else return false;
}

function serializeTable() {
	const table = document.getElementById("own_board");
	if (!table) {
	 	console.error(`Table with id "own_board" not found.`);
	  	return null;
	}

	const tableData = [];
	const rows = table.getElementsByTagName('tr');

	// Loop through each row (expecting 10 rows)
	for (let i = 0; i < rows.length; i++) {
	  	const rowData = [];
	  	const cells = rows[i].getElementsByTagName('td');

	  	// Loop through each cell (expecting 10 cells per row)
	  	for (let j = 0; j < cells.length; j++) {
			const cell = cells[j];
			// Retrieve the background color.
			// This checks for inline style; if not available, falls back to computed style.
			const bgColor =	cell.style.backgroundColor || window.getComputedStyle(cell).backgroundColor;
			rowData.push(bgColor);
	  	}
	  	tableData.push(rowData);
	}

	// Convert the 2D array into a nicely formatted JSON string.
	const stringson = JSON.stringify(tableData, null, 2);
	console.log(stringson)
	return stringson;
}

function radioClick(element) {
	for (let i = 0; i < ships.length; i++) {
		if (clicking) {
			if (ships[i].id==element.id) {
				element.checked = false;
				element.disabled = true;
				ships[i] = "";
				dships.push(element);
			} else ships[i].disabled = false;
		} else if (ships[i]!=element) ships[i].disabled = true;
	}
}

function checkSink(y, x) {
	const hitSet = new Set();
	const shipSet = new Set();
	for (let i = 0; i < dirs.length; i++) {
		var sy = y;
		var sx = x;
		if (isInbounds(sy+dirs[i][0], sx+dirs[i][1]) && 
				(document.getElementById(`own-cell-${sy+dirs[i][0]}-${sx+dirs[i][1]}`).style.backgroundColor == "blue" || 
				document.getElementById(`own-cell-${sy+dirs[i][0]}-${sx+dirs[i][1]}`).style.backgroundColor == "darkblue")) {
			shipSet.add(`${sy}${sx}`);
			hitSet.add(`${sy}${sx}`);
			sy+=dirs[i][0];
			sx+=dirs[i][1];
			while (isInbounds(sy, sx) && 
					(document.getElementById(`own-cell-${sy}-${sx}`).style.backgroundColor == "blue" || 
					document.getElementById(`own-cell-${sy}-${sx}`).style.backgroundColor == "darkblue")) {
				shipSet.add(`${sy}${sx}`);
				if (document.getElementById(`own-cell-${sy}-${sx}`).style.backgroundColor == "darkblue") {
					console.log()
					hitSet.add(`${sy}${sx}`);
				}
				sy+=dirs[i][0];
				sx+=dirs[i][1];
			}
			i++;
		}
	}
	console.log(hitSet, hitSet.size)
	console.log(shipSet, shipSet.size)
	if (hitSet.size == shipSet.size) {
		return hitSet;
	} else {
		return false;
	}
}

function place(element) {
	var ship = -1;
	var sElement = "";
	ships.forEach(s => {
		if (s.checked==true) {
			ship = s.id[0]-1;
			sElement = s;
		}
	});
	if (!clicking && element.style.backgroundColor != "blue" && ship != -1) {
		radioClick(sElement);
		curClick = element;
		clicking = true;
		var y = element.id.split("-")[2]*1;
		var x = element.id.split("-")[3]*1;
		const cy = y;
		const cx = x;
		document.getElementById(element.id).style.backgroundColor = "green";
		if (!isTouching(y-1, x) && !isTouching(y, x+1) && !isTouching(y+1, x) && !isTouching(y, x-1) &&
				!isTouching(y-1, x+1) && !isTouching(y+1, x+1) && !isTouching(y+1, x-1) && !isTouching(y-1, x-1)) {
			for (let i = 0; i < dirs.length; i++) {
				if (cy+dirs[i][0]*ship > 9 || cy+dirs[i][0]*ship < 0 || cx+dirs[i][1]*ship > 9 || cx+dirs[i][1]*ship < 0) continue;
				y+=dirs[i][0];
				x+=dirs[i][1];
				const sColCheck = [];
				while (C(y, x, cy, cx, ship)) { 
					// if (isInbounds(y+1, x) && isInbounds(y-1, x) && isInbounds(y, x+1) && isInbounds(y, x-1) &&
					// 		isInbounds(y+1, x+1) && isInbounds(y-1, x+1) && isInbounds(y-1, x-1) && isInbounds(y+1, x-1)) {
					// 	if (!isShip(y+1, x) && !isShip(y-1, x) && !isShip(y, x+1) && !isShip(y, x-1) &&
					// 			!isShip(y+1, x+1) && !isShip(y-1, x+1) && !isShip(y-1, x-1) && !isShip(y+1, x-1)) {
					// 		var check = document.getElementById(`own-cell-${y}-${x}`);
					// 		sColCheck.push(check);
					// 	}
					// }
					if (!isTouching(y-1, x) && !isTouching(y, x+1) && !isTouching(y+1, x) && !isTouching(y, x-1) &&
							!isTouching(y-1, x+1) && !isTouching(y+1, x+1) && !isTouching(y+1, x-1) && !isTouching(y-1, x-1)) {
						var check = document.getElementById(`own-cell-${y}-${x}`);
						sColCheck.push(check);
					}
					y+=dirs[i][0];
					x+=dirs[i][1];
				}
				if (sColCheck.length == ship) {
					for (let i = 0; i < ship-1; i++) {
						sColCheck[i].style.backgroundColor = "orange";
					}
					sColCheck[ship-1].style.backgroundColor = "red";
				}
				y = element.id.split("-")[2]*1;
				x = element.id.split("-")[3]*1;
			}
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
			socket.emit('enemyPlace', (`own-cell-${y}-${x}`));
			do {
				y+=dir[0];
				x+=dir[1];
				document.getElementById(`own-cell-${y}-${x}`).style.backgroundColor = "blue";
				socket.emit('enemyPlace', (`own-cell-${y}-${x}`));
			} while (y!=endY||x!=endX);
			radioClick(sElement);
			clicking = false;
			checkAllPlaced();
			console.log("checkAllPlaced called");
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 10; j++) {
					if (document.getElementById(`own-cell-${i}-${j}`).style.backgroundColor == "red" || document.getElementById(`own-cell-${i}-${j}`).style.backgroundColor == "orange")
					document.getElementById(`own-cell-${i}-${j}`).style.backgroundColor = "";
				}
			}
		} else if (element.style.backgroundColor == "green") {
			element.style.backgroundColor = "";
			clicking = false;
			ships.forEach(r => {
				if (r!="") r.disabled = false;
			});
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 10; j++) {
					var aCell = document.getElementById(`own-cell-${i}-${j}`);
					if (aCell.style.backgroundColor == "red" || aCell.style.backgroundColor == "orange") aCell.style.backgroundColor = ""; 
				}
			}
		}
	}
}

function checkAllPlaced() {
	var n = 0;
	dships.forEach(s => {
		if (s.disabled==true) {
			n++;
		}
		console.log(n, "ships placed");
	});
	if (n==5) {
		placedAll = true;
		startCheck();
		console.log('all ships placed');
	}
}

async function startCheck() {
	console.log('startcheck called')
	try {
		const response = await socket.emitWithAck('areAllShipsPlaced');
		console.log(response);
		if (response == true) {
			myTurn = await socket.emitWithAck('startGame', (number));
			console.log(myTurn);
		}
	} catch (e) {
		console.log("no response within 10 sec");
	}
}

function shoot(element) {
	if (myTurn && element.style.backgroundColor == "") {
		socket.emit('shoot', (element.id));
	}
}
	
function toggleCell(cell, color) {
	cell.style.backgroundColor = color;
}

socket.on('youGo', () => {
	myTurn = true;
});

socket.on('isShipPlaced', (callback) => {
	if (placedAll == true) {
		callback(true);
	} else {
		callback(false);
	}
	console.log("placed all:", placedAll)
});

socket.on('getNum', (callback) => {
	callback(number);
});

socket.on('change', (element) => {
	const target = element.id.replace('own', 'enemy');
	if (target) {
		toggleCell(target, color);
	}
});

socket.on('waiting', () => {
	login.style = "display: none";
	waiting.style = "";
});

socket.on('joinSuccess', (data) => {
	roomId = data.roomId;
	number = Math.floor(Math.random()*100)+1;
	number *= Math.floor(Math.random()*100)+1;
	// 1/1000000 esely arra h breakel az egesz
	waiting.style = "display: none";
	game.style = "";
	createBoard(ownBoard, "own");
	createBoard(enemyBoard, "enemy");
});

socket.on('joinFail', () => {
	alert("teli a szoba ez nem bohockocsi");
});

// socket.on('placeEnemy', (shipID) => {
// 	const cell = document.getElementById(shipID.replace("own", "enemy"));
// 	cell.style.backgroundColor = "red";
// });

socket.on('hit', (cell) => {
	console.log(`Hit registered on cell ${cell}.`);
	document.getElementById(cell).style.backgroundColor = "darkred";
});

socket.on('miss', (cell) => {
	console.log(`Miss registered on cell ${cell}.`);
	document.getElementById(cell).style.backgroundColor = "dimgrey";
	myTurn = false;
	socket.emit('passTurn');
})

socket.on('shootCheck', (cell) => {
	const cCell = cell.replace('enemy', 'own');
	let response = ["", cell];
	if (document.getElementById(cCell).style.backgroundColor == "blue") {
		response[0] = "hit";
		socket.emit('response', (response));
		console.log(response[0]);
		document.getElementById(cCell).style.backgroundColor = "darkblue";
		const setArray = Array.from(checkSink(cCell.split('-')[2]*1, cCell.split('-')[3]*1));
		socket.emit('sinkCheck', setArray);
		console.log(setArray);
	}
	else {
		document.getElementById(cCell).style.backgroundColor = "lightsteelblue";
		socket.emit('response', (response));
		console.log(response[0]);
	}
});

socket.on('shipSunk', (ship) => {
	console.log(ship);
	ship.forEach(c => {
		document.getElementById(`enemy-cell-${c[0]*1}-${c[1]*1}`).style.backgroundColor = "lightslategray";
	});
});