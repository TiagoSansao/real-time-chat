const io = require('socket.io')(5501)

const users = {};

io.on("connection", socket =>  {
    console.log('A user connected!')
    socket.on('verification', (name) => {
        if (name.length == 0) {
            socket.emit('verification', 0)
            return
        }
        let nameToCheck = name.replace(/\s+/g, "").toLowerCase()
        for(user in users) {
            if (users[user].toLowerCase() == nameToCheck) {
                socket.emit('verification', 1)
                return
            }
        }
        socket.emit('verification', 3);
    })
    socket.on('new-user', (name) => {
        users[socket.id] = name
        socket.broadcast.emit('new-user-message', name)
    })
    socket.on('send-chat-message', message =>  {
        if (users[socket.id] == null) {
            socket.emit('reload')
            return
        }
        socket.broadcast.emit('chat-message', {message: message, name: users[socket.id]})
    })
    socket.on('disconnect', () => {
        delete users[socket.id];
    })
    socket.on('user-typing', user => {
        socket.broadcast.emit('user-typing', user)
    })
})
