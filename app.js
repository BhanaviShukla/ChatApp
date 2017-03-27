var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http); //creates a new socket.io instance attached to the http server.

app.use(express.static('assets'));
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

var clients = 0;
var usernames = [];

io.on('connection', function (socket) {
    console.log('A user connected');
    clients++;
    socket.emit('newclientconnect', { description: 'Hey, welcome!' });
    socket.broadcast.emit('newclientconnect', { description: clients + ' clients connected!' })

    socket.on('new user', function (data, callback) {
        if (usernames.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = data;
            usernames.push(socket.nickname);
            updateUsernames();
        }
    });
    function updateUsernames() {
        io.sockets.emit('usernames', usernames);
    }
    socket.on('chat message', function (msg) {
        io.sockets.emit('new message', { message: msg, name: socket.nickname });
    });

    socket.on('disconnect', function () {
        console.log('A user disconnected');
        clients--;
        socket.broadcast.emit('newclientconnect', { description: clients + ' clients connected!' })
        if (!socket.nickname) return;
        usernames.splice(usernames.indexOf(socket.nickname), 1);
        updateUsernames();
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});