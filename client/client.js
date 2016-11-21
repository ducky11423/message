jQuery(function ($) {
            var socket = io.connect();
            var $nickError = $('#nickError');
            var $cName = $('#create_nickname');
            var $cPassword = $('#create_password');
            var $cPasswordConfirm = $("#create_password_confirm");
            var $cButton = $('#create_button');

            var $lName = $('#login_nickname');
            var $lPassword = $('#login_password');
            var $lButton = $('#login_button');
            var $loginError = $("#loginError");
            
            var $users = $('#users');
            var $messageField = $('#message_field');
            var $messageButton = $('#message_button');
            var $chat = $('#chat');

            var $admins = [];

            var connected = false;

            function createAccount(){
                if($cName.val() == "") {
                    $nickError.html("You must specify a username");
                    return;
                }
                if($cPassword.val() == "") {
                    $nickError.html("You must put in a password");
                    return;
                }
                if($cPassword.val() != $cPasswordConfirm.val()){
                    $nickError.html("Passwords must match");
                    return;
                }

                socket.emit('create user', {name: $cName.val(), password: $cPassword.val()}, function (data) {
                    if(data == 1){
                        $nickError.html("Your username cannot contain quotes. Scum.");
                    } else if(data == 2){
                        $nickError.html('Lmao no pls pick another username, that one is already taken.');
                    } else if (data == 3){
                        $nickError.html("Account made! Login now.");
                    }
                });
                $cName.val('');
                $cPassword.val('');
            }

            $cButton.click(function(e){
                createAccount();
            });

            $cName.keyup(function(e){
                if(e.keyCode == 13){
                    createAccount();
                }
            });

            $cPassword.keyup(function(e){
                if(e.keyCode == 13){
                    createAccount();
                }
            });

            $cPasswordConfirm.keyup(function(e){
                if(e.keyCode == 13){
                    createAccount();
                }
            });

            function login(){
                if($lName.val() == "") {
                    $loginError.html("You must specify a username");
                    return;
                }
                if($lPassword.val() == "") {
                    $loginError.html("You must put in a password");
                    return;
                }

                socket.emit('login', {name: $lName.val(), password: $lPassword.val()}, function (data) {
                    if(data == 1){
                        $loginError.html("User already logged in.");
                    } else if (data == 2){
                        $loginError.html("Username doesn't exist.");
                    } else if (data == 3){
                        $loginError.html("Password is incorrect.");
                    }  else if(data) {
                        $('#nickWrap').hide();
                        $('#contentWrap').show();
                        $('#users').show();
                        $admins = data;
                        connected = true;
                    } else {

                    }
                });
                $lName.val('');
                $lPassword.val('');
            }

            $lButton.click(function(e){
                login();
            });

            $lName.keyup(function(e){
                if(e.keyCode == 13){
                    login();
                }
            });

            $lPassword.keyup(function(e){
                if(e.keyCode == 13){
                    login();
                }
            });

            function submitMessage(){
                if($messageField.val() != ""){
                    if(connected) {
                        socket.emit('send message', $messageField.val(), function(data){
                        document.getElementById('chat').innerHTML += "<span class='error'>" + data + "</span></br>";
                        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                        });
                    } else {
                        document.getElementById('chat').innerHTML += "<span class='error'><b> You are not connected! Please login again!</span></br>";
                        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                    }
                }
                
                $messageField.val('');
            }

            $messageButton.click(function(e){
                submitMessage();
            });

            $messageField.keyup(function(e){
                if(e.keyCode == 13){
                    submitMessage();
                }
            })

            socket.on('usernames', function(data){
                var html = '';
                console.log($admins);
                for (i = 0; i < data.length; i++) {
                    if($admins.indexOf(data[i]) != -1) html += "<span class='admin'>" + data[i] + "</span></br>";
                    else html += data[i] + '<br/>'
                }
                $users.html(html);
            });

            socket.on('new message', function (data) {
                if(connected) {
                    if($admins.indexOf(data.nick) != -1) document.getElementById('chat').innerHTML += "<span class='msg'><b><span class='admin'>" + data.nick + ":</span></b> " + data.msg + "</span></br>";
                    else document.getElementById('chat').innerHTML += "<span class='msg'><b>" + data.nick + ":</b> " + data.msg + "</span></br>";
                    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                }
            });

            socket.on('whisper', function(data){
                if(connected){
                    document.getElementById('chat').innerHTML += "<span class='whisper'><b>" + data.nick + ":</b> " + data.msg + "</span></br>";
                    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                }
            });

            socket.on('user joined', function(data){
                if(connected){
                    if($admins.indexOf(data) != -1) document.getElementById('chat').innerHTML += "<span class='alert'><b><span class='admin'>" + data + "</span></b> has joined.</span></br>";
                    else document.getElementById('chat').innerHTML += "<span class='alert'><b>" + data + "</b> has joined.</span></br>";
                    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                }
            });

            socket.on('user left', function(data){
                if(connected){
                    if($admins.indexOf(data) != -1) document.getElementById('chat').innerHTML += "<span class='alert'><b><span class='admin'>" + data + "</span></b> has left.</span></br>";
                    else document.getElementById('chat').innerHTML += "<span class='alert'><b>" + data + "</b> has left.</span></br>";
                    document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                }
            })

            socket.on('error', function(err){
                if(err.message == "websocket error"){
                    alert("You have been disconnected. Please login again.");
                    connected = false;
                    delete socket;
                }
            });

            socket.on('disconnect', function(data){
                alert("You have been disconnected. Please login again.");
                connected = false;
                delete socket;
            });
        });
