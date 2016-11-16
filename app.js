var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = {};

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
        if (data in users) {
            callback(false);
        } else {
            callback(true);
            var nick = escapeChars(data)
            if(nick.length > 16){
                nick = nick.substring(0, 15);
                nick += "...";
            }
            socket.nickname = nick;
            users[socket.nickname] = socket;
            updateNicknames();
        }
    });

    function updateNicknames() {
        io.sockets.emit('usernames', Object.keys(users));
    }

    socket.on('send message', function (data, callback) {
      var msg = data.trim();
      if(msg.substr(0,3) === '/w '){
        msg = msg.substr(3);
        var ind = msg.indexOf(' ');
        if(ind !== -1){
          var name = msg.substring(0, ind);
          var msg = msg.substring(ind + 1);
          if(name in users){
            users[name].emit('whisper', { msg: escapeChars(msg), nick: socket.nickname });
            console.log('Whisper!');
          } else{
            callback('Whoops! Try typing a valid user next time lmao.');
          }
        } else{
          callback('Whoops! Try typing a message next time lmao.');
        }
      } else{
          io.sockets.emit('new message', { msg: escapeChars(msg), nick: socket.nickname });
      }
    });

    socket.on('disconnect', function (data) {
        if (!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });
});


function escapeChars(input){
    input = input.replace(new RegExp("<", "g"), "&lt;");
    input = input.replace(new RegExp(">", "g"), "&gt;");
    input = input.replace(new RegExp("/", "g"), "&frasl;");
    return input;
}
