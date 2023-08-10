const socket = io();
const messagesDiv = document.getElementById('messages');
const participantsDiv = document.getElementById('participants');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message');
const roomNumberTitle = document.getElementById('room-number');

let username = '';
let roomNumber = '';
window.onload = () => {
    messageInput.addEventListener('keydown', handleKeyPress);

    const userInfoJSON = localStorage.getItem('userInfo');
    if (!userInfoJSON) {
        do {
            username = prompt('Please enter your username (at least 3 letters long):');
        } while (!username || username.length < 3);

        do {
            roomNumber = Number(prompt('Please enter the room number:'));
        } while (!roomNumber || typeof roomNumber !== 'number');

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

socket.on('chat:message', ({ roomNumber, author, msg, type }) => {
    const messageDiv = document.createElement('div');
    const authorH4 = document.createElement('h4');
    const msgPar = document.createElement('p');
    messageDiv.className = author === username ? 'incoming message' : 'outgoing message';
    msgPar.innerText = msg;
    authorH4.innerHTML = author + ' - ' + getFormattedTimestamp();
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

const getFormattedTimestamp = () => {
    const now = new Date();
    const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Use 24-hour format
    };

    return now.toLocaleString('he-IL', options);
};

const sendMessage = () => {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    if (message && username) {
        socket.emit('chat:message', { roomNumber, username, message, type: 'outgoing' });
        messageInput.value = '';
    }
};

const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
};

const signOut = () => {
    localStorage.clear();
    document.location.reload();
};
