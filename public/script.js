//  Elements and imports

const socket = io('localhost:3000');
const sendForm = document.getElementById('send-form');
const sendMessage = document.getElementById('send-message');
const messageContainer = document.getElementById('message-container');
const formName = document.getElementById('form-name');
const typing = document.getElementById('typing');
const nameError = document.getElementById('name-error');
const popup = document.getElementById('popup');
const messageSubmit  = document.getElementById('message-submit');
const connectedList = document.getElementById('connected-list');
var name;
var count = 0; // Utilized in the ant-flood


// Receiving and sending information from the server

socket.on('users-list', users => {
    while(connectedList.firstChild) {
        connectedList.firstChild.remove();
    }
    users.forEach(user => {
        appendUser(user);
    })
})

socket.on('new-user-message', (name) => {
    appendMessage(`<b>${name}</b> entrou no chat!`);
})

socket.on('disconnect-message', name => {
    appendMessage(`<b>${name}</b> desconectou-se do chat.`, );
})

socket.on('reload', () => {
    location.reload();
})

socket.on('user-typing', user => {
    typing.innerHTML = `<b>${user}</b> está digitando...`;
    setTimeout(() => {typing.innerHTML = ''}, 1000);
})

socket.on('chat-message', data => {
    appendMessage(`<b>${data.name}:</b> ${data.message}`);
})

// Event listeners

formName.addEventListener('submit', e => { // Login submit
    e.preventDefault();
    name = document.querySelector('input#name-input').value;
    nameError.innerHTML = '';
    socket.emit('verification', name);
    socket.on('verification', check => {
        if (check == 0) {
            nameError.innerHTML = "Um nome deve ter no minímo 3 caracteres";
        } else if (check == 1) {
            nameError.innerHTML = "Este nome já está em uso.";
        } else {
            let getName = document.getElementById('get-name');
            getName.remove();
            socket.emit('new-user', name);
            document.getElementById('online-people').style.opacity = 1;
            document.getElementById('rooms').style.opacity = 1;
            appendMessage(`<b>${name}</b> entrou no chat!`, true); 
        }
    })
})

sendForm.addEventListener('submit', (e) => { // Send message submit
    e.preventDefault();
    let message = sendMessage.value;
    if (message.length != 0) {
        if (count < 3) {
            socket.emit('send-chat-message', message);
            sendMessage.value = '';
            sendMessage.focus();
            appendMessage(`<b>${name}:</b> ${message}`, true);
            antFlood();
        } else {
            popupOn('Escreva mais calmamente.');
        }
    } else {
        popupOn('Não é possível enviar mensagens vazias!');
    }
})

sendMessage.addEventListener("change", () => { // When someone writes something is triggered
    socket.emit('user-typing', name);
})

// Functions

function appendUser(name) {
    let connectedUser = document.createElement('li');
    connectedUser.innerHTML = name;
    connectedList.appendChild(connectedUser);
}

function appendMessage(message, sender) { //if sender is true, he is own who wrote the message
    let messageElement = document.createElement('span');
    messageElement.innerHTML = `<i>${new Date().getHours()}:${new Date().getMinutes()}</i> ${message}`;
    if (sender == true) {
        messageElement.classList.add('message-owner');
    }
    messageElement.classList.add('message');
    messageContainer.appendChild(messageElement);
    new Audio("assets/MessageSound.mp3").play();
}
function popupOn(msg) {
    popup.innerHTML = msg;
    popup.classList.add('popupvisible');
    setTimeout(() => {popup.classList.remove('popupvisible')}, 1500);
}

function antFlood() {
    count++;
    if (count > 0) {
        setTimeout(() => {count--}, 5000);
    }
}