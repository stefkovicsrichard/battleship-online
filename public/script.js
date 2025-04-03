const socket = io();

const login = document.getElementById("credentials");
const game = document.getElementById("game");
game.style = "display: none"

const ownBoard = document.getElementById("own_board");
const enemyBoard = document.getElementById("enemy_board");

var clicking = false;
var curClick = "";


function createBoard(container, prefix, isClickable = false) {
  	const table = document.createElement("table");
  	for (let i = 0; i < 10; i++) {
    	const tr = document.createElement("tr");
    	for (let j = 0; j < 10; j++) {
      		const td = document.createElement("td");
      		td.id = `${prefix}-cell-${i}-${j}`;
      		if (isClickable && prefix == "own") {
				td.addEventListener("click", function () {
					place(this);
			  	});
      		} else if (isClickable && prefix == "enemy") {
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

function C(y, x) {
	return ((!(y>=10) && !(y<0) && !(x>=10) && !(x<0)) && (!(y>cy+ship) && !(y<cy-ship) && !(x>cx+ship) && !(x<cx-ship)) && (!document.getElementById(`own-cell-${y}-${x}`).style.backgroundColor == 'blue'))?true:false;
}

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
		socket.emit('change', (element));

		for (let i = 0; i < dirs.length; i++) {
			y+=dirs[i][0];
			x+=dirs[i][1];
			while ( C(y, x) ) {
				var check = document.getElementById(`own-cell-${y}-${x}`);
				if (!check.style.backgroundColor == "grey") {
					
				} else {
					y+=dirs[i][0];
					x+=dirs[i][1];
				}
			}
			if (C(y, x)) {
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
			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 10; j++) {
					if (document.getElementById(`own-cell-${i}-${j}`).style.backgroundColor == "red")
					document.getElementById(`own-cell-${i}-${j}`).style.backgroundColor = "";
				} 
			}
		}
	}
}
	
function toggleCell(cell, color) {
	cell.style.backgroundColor = color;
}

socket.on('change', (element) => {
	const target = element.id.replace('own', 'enemy');
	if (target) {
		toggleCell(target, color);
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
