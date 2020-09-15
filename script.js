const socket = io('localhost:5501')
const sendForm = document.getElementById('send-form')
const sendMessage = document.getElementById('send-message')
const messageContainer = document.getElementById('message-container')
const formName = document.getElementById('form-name')
const typing = document.getElementById('typing')
const nameError = document.getElementById('name-error')
const popup = document.getElementById('popup')
const messageSubmit  = document.getElementById('message-submit')
var name
var count = 0 // Variável utilizada pra mutar o usuário caso exceda um limite de msgs 

//

socket.on('reload', () => {
    location.reload()
})

socket.on('chat-message', data => {
    appendMessage(`<b>${data.name}:</b> ${data.message}`)
})

socket.on('new-user-message', (name) => {
    appendMessage(`<b>${name}</b> entrou no chat!`)
})

socket.on('user-typing', user => {
    typing.innerHTML = `<b>${user}</b> está digitando...`
    setTimeout(() => {typing.innerHTML = ''}, 1000);
})

//

sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let message = sendMessage.value
    if (message.length != 0) {
        if (count < 3) {
            socket.emit('send-chat-message', message)
            sendMessage.value = ''
            sendMessage.focus()
            appendMessage(`<b>${name}:</b> ${message}`)
            antFlood();
        } else {
            popupOn('Escreva mais calmamente.')
        }
    } else {
        popupOn('Não é possível enviar mensagens vazias!');
    }
})

sendMessage.addEventListener("change", () => {
    socket.emit('user-typing', name)
})

formName.addEventListener('submit', e => {
    e.preventDefault();
    name = document.querySelector('input#name-input').value
    nameError.innerHTML = ''
    socket.emit('verification', name);
    socket.on('verification', check => {
        if (check == 0) {
            nameError.innerHTML = "É necessário um nome para entrar."
        } else if (check == 1) {
            nameError.innerHTML = "Este nome já está em uso."
        } else {
            let getName = document.getElementById('get-name')
            getName.remove();
            socket.emit('new-user', name)
            appendMessage(`<b>${name}</b> entrou no chat!`);
        }
    })
})

//

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerHTML = message
    messageContainer.appendChild(messageElement)
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
        console.log(count);
    }
}