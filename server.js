import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const server = createServer(app);
const io = new Server(server, {
	connectionStateRecovery: {}
});




const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
	console.log('connect');
	
    // socket.on('enemyPlace', (shipID) => {
	// 	socket.broadcast.emit('placeEnemy', (shipID));
	// });
		
	async function getSocketFromID(e, roomid) {
		const sockets = await io.in(roomid).fetchSockets();
		var index = sockets.indexOf(e)
		return sockets[index];
	}

	socket.on('joinRoom', (data) => {
		socket.username = data.username;
		socket.room = data.roomId;
		if ((io.sockets.adapter.rooms.get(socket.room)?.size || 0) < 2) {
			socket.join(data.roomId);
			socket.emit('waiting');
			console.log(`${socket.username} belepett a(z) ${socket.room} szobaba (${(io.sockets.adapter.rooms.get(socket.room)?.size || 0)}/2)`);
			if ((io.sockets.adapter.rooms.get(socket.room)?.size || 0) == 2) {
				socket.emit('joinSuccess', (data))
				socket.to(socket.room).emit('joinSuccess', (data))
			}
		} else {
			socket.emit('joinFail');
		}
	});
	
	socket.on('areAllShipsPlaced', async (callback) => {
		console.log("bothPlacedShips called")
		const response = await socket.timeout(10000).broadcast.emitWithAck('isShipPlaced');
		console.log("broadcast placed ship", response, typeof response)
		if (response[0] == true) callback(true);
		else callback(false);
	});

	socket.on('startGame', async (number, callback) => {
		console.log("startgame called by playernum", number)
		try {
			const response = await socket.timeout(10000).broadcast.emitWithAck('getNum');
			console.log(response)
			if (response[0] > number) {
				const sockets = await io.in(socket.room).fetchSockets();
				var p2 = "";
				sockets.forEach((s) => {
					if (s!=socket.id) p2 = s;
				});
				console.log(p2.username, "starts")
				socket.broadcast.emit('youGo');
				callback(false);
			} else {
				console.log(socket.username, "starts")
				callback(true);
			}
		} catch (e) {
			console.log(e)
		}
	});

	socket.on('shoot', (cell) => {
		console.log(`Shot to cell ${cell} sent.`);
		socket.broadcast.emit('shootCheck', cell);
	});

	socket.on('sinkCheck', (sunk) => {
		if (sunk!=false) socket.broadcast.emit('shipSunk', (sunk));
	});

	socket.on('response', (response) => {
		if (response[0] == "hit") socket.broadcast.emit('hit', response[1]);
		else socket.broadcast.emit('miss', response[1]);
	});

  	socket.on('disconnect', () => {
    	console.log('A client disconnected');
  	});
})

server.listen(3000, () => {
    console.log('port 3000');
});