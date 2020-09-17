// Imports

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const port = 3000;

// Routes

app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "public"));
app.engine('html', require('ejs').renderFile);
app.set('view-engine', 'html');

app.get('/', (res, req) => {
    res.render('index.html');
})


// Connection with the client

var users = [];

io.on("connection", socket =>  {

    socket.on('verification', (name) => {

        let nameToCheck = name.replace(/\s+/g, "").toLowerCase()

        if (nameToCheck.length < 3) {
            socket.emit('verification', 0)
            return
        }

        for(user in users) {
            if (users[user].toLowerCase() == nameToCheck) {
                socket.emit('verification', 1)
                return
            }
        }

        socket.emit('verification', 3);

    })
    
    socket.on('new-user', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('new-user-message', name);
        console.log(`${name} joined the chat!`);
    })

    socket.on('disconnect', () => {
        if (users[socket.id] != undefined || users[socket.id] != null) {
            socket.broadcast.emit('disconnect-message', users[socket.id]);
        }
        delete users[socket.id];
    })

    socket.on('send-chat-message', message =>  {
        if (users[socket.id] == null) {
            socket.emit('reload')
            return
        }
        socket.broadcast.emit('chat-message', {message: message, name: users[socket.id]})
    })

    socket.on('user-typing', user => {
        socket.broadcast.emit('user-typing', user)
    })

})

// Turning on the server 

server.listen(port, () => {console.log(`Server running on port: ${port}`)})