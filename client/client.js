jQuery(function ($) {
            var socket = io.connect();
            var $nickError = $('#nickError');
            var $nickBox = $('#nickname_field');
            var $nickButton = $('#nickname_button');
            var $users = $('#users');
            var $messageField = $('#message_field');
            var $messageButton = $('#message_button');
            var $chat = $('#chat');

            function createAccount(){
                
            }

            $nickButton.click(function(e){
                submitNick();
            });

            $nickBox.keyup(function(e){
                if(e.keyCode == 13){
                    submitNick();
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
