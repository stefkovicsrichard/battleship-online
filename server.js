import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const server = createServer(app);
const io = new Server(server);



const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('connect');

    socket.on('clicked', (cellCoords) => {
    	// Broadcast the 'change' event to all other connected clients.
    	socket.broadcast.emit('change', cellCoords);
  	});

  	socket.on('joinRoom', (data) => {
		if ((io.sockets.adapter.rooms.get(data.roomId)?.size || 0) < 2) {
			socket.join(data.roomId);
			console.log(`${data.username} belepett a(z) ${data.roomId} szobaba`);
			socket.emit('joinSuccess', (data));
		} else {
			socket.emit('joinFail');
		}
  	});

  	socket.on('disconnect', () => {
    	console.log('A client disconnected');
  	});
})

server.listen(3000, () => {
    console.log('port 3000');
});