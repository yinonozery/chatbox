const socket = io();
const messagesDiv = document.getElementById('messages');
const participantsDiv = document.getElementById('participants');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message');
const roomNumberTitle = document.getElementById('room-number');

let username = '';
let roomNumber = '';
window.onload = () => {
    messageInput.addEventListener('keydown', addMsg);

    const userInfoJSON = localStorage.getItem('userInfo');
    if (!userInfoJSON) {
        do {
            username = prompt('Please enter your username:');
            roomNumber = prompt('Please enter the room number:');
        } while (!username);
        localStorage.setItem('userInfo', JSON.stringify({ username, roomNumber }));
        roomNumberTitle.innerText = `Room: ${roomNumber}, Name: ${username}`;
    } else {
        const userInfo = JSON.parse(userInfoJSON);
        username = userInfo.username;
        roomNumber = userInfo.roomNumber;
        roomNumberTitle.innerText = `Room: ${roomNumber}, Name: ${username}`;
    }
    socket.emit('chat:join-room', { roomNumber, username });
};

const addMsg = (event) => {
    if (event.which === 13 && !event.shiftKey) {
        const message = messageInput.value.trim();
        if (message && username) {
            socket.emit('chat:message', { roomNumber, username, message, type: 'outgoing' });
            messageInput.value = '';
        }
        event.preventDefault();
    }
};

socket.on('chat:message', ({ roomNumber, author, msg, type }) => {
    const messageDiv = document.createElement('div');
    const authorH4 = document.createElement('h4');
    const msgPar = document.createElement('p');
    messageDiv.className = author === username ? 'incoming message' : 'outgoing message';
    msgPar.innerText = msg;
    authorH4.innerHTML = author;
    messageDiv.appendChild(authorH4);
    messageDiv.appendChild(msgPar);
    messagesDiv.appendChild(messageDiv);
});

socket.on('room-participants', (participants) => {
    // Update participants list
    const participantsList = document.createElement('div');
    let i = 1;
    for (const room in participants) {
        if (participants.hasOwnProperty(room)) {
            const participant = document.createElement('div');
            participant.innerText = participants[room] === username ? 'Me' : `${participants[room]}`;
            participantsList.append(participant);
            i++;
        }
    }
    participantsDiv.innerText = '';
    participantsDiv.append(participantsList);
});
