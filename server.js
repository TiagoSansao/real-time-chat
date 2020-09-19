// Imports

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

// Server port
const port = 3000;

// Routes

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view-engine', 'html');

app.get('*', (req, res) => {
  res.render('index.html');
});

// Global variables

const users = [];
let names;

// Functions

function getConnectedPeople() {
  names = Object.values(users);
  console.log(names)
  return names;
}

// Connection with the client

io.on('connection', (socket) => {
  socket.on('verification', (name) => {
    const nameToCheck = name.replace(/\s+/g, '').toLowerCase();
    if (nameToCheck.length < 3) {
      socket.emit('verification', 0);
      return;
    }
    if (names !== undefined) {
      for(let i; i < names.length; i += 1) {
        if (names[i] === nameToCheck) {
          socket.emit('verification', 1);
          return;
        }
      }
    }
    socket.emit('verification', 3);
  });

  socket.on('new-user', (name) => {
    users[socket.id] = name;
    socket.broadcast.emit('new-user-message', name);
    socket.broadcast.emit('users-list', getConnectedPeople());
    socket.emit('users-list', names);
    console.log(`${name} joined the chat!`);
  });

  socket.on('disconnect', () => {
    if (users[socket.id] !== undefined && users[socket.id] !== null) {
      socket.broadcast.emit('disconnect-message', users[socket.id]);
    }
    console.log(`${users[socket.id]} left the chat!`);
    delete users[socket.id];
    socket.broadcast.emit('users-list', getConnectedPeople());
  });

  socket.on('send-chat-message', (message) => {
    if (users[socket.id] == null) {
      socket.emit('reload');
      return;
    }
    socket.broadcast.emit('chat-message', {
      message: message,
      name: users[socket.id],
    });
  });

  socket.on('user-typing', (username) => {
    socket.broadcast.emit('user-typing', username);
  });
});

// Turning on the server

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
