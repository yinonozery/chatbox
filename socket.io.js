const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('chat:join-room', (roomData) => {
        const { roomNumber, username } = roomData;

        // Create room if room doesn't exist
        if (!rooms[roomNumber]) {
            rooms[roomNumber] = {};
        }

        // Join the room
        socket.join(roomNumber);
        rooms[roomNumber][socket.id] = username;

        // Return updated data to client
        io.to(roomNumber).emit('room-participants', rooms[roomNumber]);
    });

    socket.on('chat:message', ({ roomNumber, username, message, type }) => {
        console.log(username);
        io.to(roomNumber).emit('chat:message', {
            author: username,
            msg: message,
            type: type,
        });
    });

    socket.on('disconnect', () => {
        // Remove user from room and participants list
        for (const roomNumber in rooms) {
            if (rooms[roomNumber][socket.id]) {
                delete rooms[roomNumber][socket.id];
                io.to(roomNumber).emit('room-participants', Object.values(rooms[roomNumber]));
            }
        }
    });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
