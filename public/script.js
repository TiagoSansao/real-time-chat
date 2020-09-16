//  Elements and imports

const socket = io('localhost:3000')
const sendForm = document.getElementById('send-form')
const sendMessage = document.getElementById('send-message')
const messageContainer = document.getElementById('message-container')
const formName = document.getElementById('form-name')
const typing = document.getElementById('typing')
const nameError = document.getElementById('name-error')
const popup = document.getElementById('popup')
const messageSubmit  = document.getElementById('message-submit')
var name
var count = 0 // Utilized in the ant-flood


// Receiving information from the server

socket.on('new-user-message', (name) => {
    appendMessage(`<b>${name}</b> entrou no chat!`)
})

socket.on('disconnect-message', name => {
    appendMessage(`<b>${name}</b> desconectou-se do chat.`, )
})

socket.on('reload', () => {
    location.reload()
})

socket.on('user-typing', user => {
    typing.innerHTML = `<b>${user}</b> está digitando...`
    setTimeout(() => {typing.innerHTML = ''}, 1000);
})

socket.on('chat-message', data => {
    appendMessage(`<b>${data.name}:</b> ${data.message}`)
})

// Event listeners

formName.addEventListener('submit', e => { // Login submit
    e.preventDefault();
    name = document.querySelector('input#name-input').value
    nameError.innerHTML = ''
    socket.emit('verification', name);
    socket.on('verification', check => {
        if (check == 0) {
            nameError.innerHTML = "O minímo de caracteres é 3!"
        } else if (check == 1) {
            nameError.innerHTML = "Este nome já está em uso."
        } else {
            let getName = document.getElementById('get-name')
            getName.remove();
            socket.emit('new-user', name)
            appendMessage(`<b>${name}</b> entrou no chat!`, true); 
        }
    })
})

sendForm.addEventListener('submit', (e) => { // Send message submit
    e.preventDefault();
    let message = sendMessage.value
    if (message.length != 0) {
        if (count < 3) {
            socket.emit('send-chat-message', message)
            sendMessage.value = ''
            sendMessage.focus()
            appendMessage(`<b>${name}:</b> ${message}`, true)
            antFlood();
        } else {
            popupOn('Escreva mais calmamente.')
        }
    } else {
        popupOn('Não é possível enviar mensagens vazias!');
    }
})

sendMessage.addEventListener("change", () => { // When someone writes something is triggered
    socket.emit('user-typing', name)
})

// Functions

function appendMessage(message, sender) { //if sender is true, he is own who wrote the message
    const messageElement = document.createElement('span');
    messageElement.innerHTML = `<i>${new Date().getHours()}:${new Date().getMinutes()}</i> ${message}`
    if (sender == true) {
        messageElement.classList.add('message-owner');
    }
    messageElement.classList.add('message');
    messageContainer.appendChild(messageElement);
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