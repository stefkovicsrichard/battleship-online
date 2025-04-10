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

  	socket.on('joinRoom', (data) => {
		if ((io.sockets.adapter.rooms.get(data.roomId)?.size || 0) < 2) {
			socket.join(data.roomId);
			socket.emit('waiting');
			console.log(`${data.username} belepett a(z) ${data.roomId} szobaba (${(io.sockets.adapter.rooms.get(data.roomId)?.size || 0)}/2)`);
			if ((io.sockets.adapter.rooms.get(data.roomId)?.size || 0) == 2) {
				socket.emit('joinSuccess', (data))
				socket.to(data.roomId).emit('joinSuccess', (data))
			}
		} else {
			socket.emit('joinFail');
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