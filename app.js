var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server), 
    fs = require('fs'),
    sha1 = require('sha1')
    users = {}, 
    accounts = {};

fs.readFile(__dirname + "/users.json", (err, data) => {
    if(err){
        if(err.code === "ENOENT"){
            fs.writeFile(__dirname + "/users.json", "{}", (err) => {
                if(err) throw err;
            });
        } else throw err;
    }

    var parsed = JSON.parse(data);
    for(var x in parsed){
        accounts.push(parsed[x]);
    }
})

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
          if(data.indexOf(' ') == -1){
            callback(true);
            var nick = escapeChars(data);
            if(nick.length > 16){
                nick = nick.substring(0, 15);
            }
            socket.nickname = nick;
            users[socket.nickname] = socket;
            updateNicknames();
        }
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
            users[name].emit('whisper', { msg: escapeChars(msg), nick: socket.nickname + " -> You" });
            users[socket.nickname].emit('whisper', {msg: escapeChars(msg), nick: "You -> " + name});
            console.log(socket.nickname);
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

    socket.on('create user', function (data, callback) {
        var userExists = false;
        for(var v in accounts){
            if(v.name == data.name) {
                userExists = true;
                callback(false);
            }
        }
        if(!userExists){
            var pwd = sha1(data.password);
            accounts.push({name: data.name, password: pwd})

            saveAccounts();
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

function saveAccounts(){
    var json = JSON.stringify(accounts);
    fs.writeFile(__dirname + "/users.json", json, (err) => {
        if(err) throw err;
    });

}