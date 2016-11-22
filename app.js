var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    sha1 = require('sha1')
    users = {},
    accounts = [],
    admins = [
        "Ducky",
        "Ducky2",
        "Jacob",
        "Chilleh",
        "Zxl",
        "Admin",
        "chraffx"
    ];

fs.readFile(__dirname + "/users.json", (err, data) => {
    if(err){
        if(err.code === "ENOENT"){
            fs.writeFile(__dirname + "/users.json", "{}", (err) => {
                if(err) throw err;
            });
        } else throw err;
    }

    if(data == "") return;

    var parsed = JSON.parse(data);
    for(var x in parsed){
        accounts.push(parsed[x]);
    }
})

server.listen(3000);

app.get('/message', function (req, res) {
    res.sendfile(__dirname + '/client/index.html');
});

if("dev" in process.argv) {
    app.get('/client/*', function (req, res) {
        res.sendfile(__dirname + req.url);
    });
}

io.sockets.emit('disconnect');

io.sockets.on('connection', function (socket) {


    socket.on('login', function (data, callback) {
        if (data.name in users) {
            callback(1);
            return;
        } else {
            var accountFound = false;

            for(i = 0; i < accounts.length; i++){
              var account = accounts[i];
              if(account.name == data.name){
                  accountFound = true;
                  if(sha1(data.password) == account.password){
                      socket.nickname = account.name;
                      users[socket.nickname] = socket;
                      callback(admins);
                      updateNicknames();
                      io.sockets.emit('user joined', account.name);
                      return;
                  } else callback(3);
              }
            }
            if(!accountFound){
                callback(2);
                return;
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
      } else if(msg.substr(0,5) === '/kick '){
          var ind = msg.indexOf(' ');
          if(ind !== -1){
            var name = msg.substring(6, msg.length);
            if(name in users){
              socket.emit('disconnect', users[name]);
              console.log('kick!');
            }
          }
        }  else{
          io.sockets.emit('new message', { msg: escapeChars(msg), nick: socket.nickname });
      }
    });

    socket.on('create user', function (data, callback) {

        if(data.name.indexOf('"') != -1){
            callback(1);
            return;
        }
        var userExists = false;
        for(i = 0; i < accounts.length; i++){
            var v = accounts[i];
            if(v.name == data.name) {
                userExists = true;
                callback(2);
            }
        }
        if(!userExists){
            var pwd = sha1(data.password);
            accounts[accounts.length] = {name: data.name, password: pwd};

            saveAccounts();
            callback(3);
        }
    });

    socket.on('disconnect', function (data) {
        if (!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
        io.sockets.emit('user left', socket.nickname)
    });
});


function escapeChars(input){
    input = input.replace(new RegExp("<", "g"), "&lt;");
    input = input.replace(new RegExp(">", "g"), "&gt;");
    input = input.replace(new RegExp("/", "g"), "&#47");
    return input;
}

function saveAccounts(){
    //var json = JSON.stringify(accounts);
    var json = "{";
    for(i = 0; i < accounts.length; i++){
        json += "\"" + i + "\":{\"name\":\"" + accounts[i].name + "\", \"password\":\"" + accounts[i].password + "\"}";
        if(accounts[i+1]) json += ",";
    }
    json += "}";
    fs.writeFile(__dirname + "/users.json", json, (err) => {
        if(err) throw err;
    });
}
