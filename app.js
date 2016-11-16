var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    nicknames = [];

server.listen(3000);

app.get('/message', function (req, res) {
    res.sendfile(__dirname + '/client/index.html');
});

if(process.argv[2] == "dev") {
    app.get('/client/*', function (req, res) {
        res.sendfile(__dirname + req.url);
    });
}

io.sockets.on('connection', function (socket) {
    socket.on('new user', function (data, callback) {
        if (nicknames.indexOf(data) != -1) {
            callback(false);
        } else {
            callback(true);
            socket.nickname = escapeChars(data);
            nicknames.push(socket.nickname);
            updateNicknames();
        }
    });

    function updateNicknames() {
        io.sockets.emit('usernames', nicknames);
    }

    socket.on('send message', function (data) {
        io.sockets.emit('new message', { msg: escapeChars(data), nick: socket.nickname });
    });

    socket.on('disconnect', function (data) {
        if (!socket.nickname) return;
        nicknames.splice(nicknames.indexOf(socket.nickname), 1);
        updateNicknames();
    });
});


function escapeChars(input){
    input = input.replace("<", "&lt;");
    input = input.replace(">", "&gt;");
    input = input.replace("/", "&frasl;");
    return input;
}