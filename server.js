const express = require('express');
const app = express();
const io = require('socket.io')(80);
const path = require('path');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
var connection = require('./configuration/database')(mongoose);
var models = require('./configuration/database_models/models')(connection);

const routes = require('./api/routes');

const serverSettings = {
  'environment' : 'development',
  'development' : {
    'port' : 3000
  }
}


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

routes.allRoutes(app, models);

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/socketio', express.static("node_modules/socket.io-client/dist/socket.io.js"))

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'chat.html'));
})


app.listen(serverSettings[serverSettings.environment]['port'], ()=>{
  console.log(`Server started on http://localhost:${serverSettings[serverSettings.environment]['port']}`)
});


io.on('connection', (socket)=>{
  console.log('user connected');

  // Init username to Unknown until there is a username confirmation.
  socket.username = 'Unknown';

  socket.on('change_username', (data)=>{
    socket.username = data.username;
    console.log(`Username changed to ${data.username} its socketid ${socket.id}`);
  })

  // Detect if user is still online.
  socket.on('user online', function(data){
    socket.broadcast.emit('user online', { username : data.username, socketid : socket.id });
  })

  // Listen to messages from users and deliver to intended client.
  socket.on('chat message', function(data){
    io.sockets.to(data.to).emit('chat message', { message : data.message, username : socket.username});
  });

  // Listen and broadcast that user has disconnected to all clients.
  socket.on("disconnect", ()=>{
    socket.broadcast.emit('user offline', { username : socket.username });
    console.log("Disconnected")
  })
});