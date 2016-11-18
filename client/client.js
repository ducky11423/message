jQuery(function ($) {
            var socket = io.connect();
            var $nickError = $('#nickError');
            var $cName = $('#create_nickname');
            var $cPassword = $('#create_password');
            var $cButton = $('#create_button');
            
            var $users = $('#users');
            var $messageField = $('#message_field');
            var $messageButton = $('#message_button');
            var $chat = $('#chat');

            function createAccount(){
                if($cName.val() == "") {
                    $nickError.html("You must specify a username");
                    return;
                }
                if($cPassword.val() == "") {
                    $nickError.html("You must put in a password");
                    return;
                }

                socket.emit('create user', {name: $cName.val(), password: $cPassword.val()}, function (data) {
                    if (data){
                        $('#nickWrap').hide();
                        $('#contentWrap').show();
                        $('#users').show();
                    } else {
                        $nickError.html('Lmao no pls pick another username, that one is already taken.');
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

            $messageButton.click(function(e){
                submitMessage();
            });

            $messageField.keyup(function(e){
                if(e.keyCode == 13){
                    submitMessage();
                }
            })

            function submitNick(){
                socket.emit('new user', $nickBox.val(), function (data) {
                    if (data){
                        $('#nickWrap').hide();
                        $('#contentWrap').show();
                        $('#users').show();
                    } else {
                        $nickError.html('Lmao no pls pick another username, that one is already taken.');
                    }
                });
                $nickBox.val('');
            }

            function submitMessage(){
                if($messageField.val() != ""){
                    socket.emit('send message', $messageField.val(), function(data){
                        document.getElementById('chat').innerHTML += "<span class='error'>" + data + "</span></br>";
                        document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                    });
                }
                
                $messageField.val('');
            }

            socket.on('usernames', function(data){
                var html = '';
                for (i = 0; i < data.length; i++) {
                    html += data[i] + '<br/>'
                }
                $users.html(html);
            });

            socket.on('new message', function (data) {
                document.getElementById('chat').innerHTML += "<span class='msg'><b>" + data.nick + ":</b> " + data.msg + "</span></br>";
                document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
            });

            socket.on('whisper', function(data){
              document.getElementById('chat').innerHTML += "<span class='whisper'><b>" + data.nick + ":</b> " + data.msg + "</span></br>";
              document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
            });
        });
