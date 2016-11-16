jQuery(function ($) {
            var socket = io.connect();
            var $nickForm = $('#setNick');
            var $nickError = $('#nickError');
            var $nickBox = $('#nickname');
            var $users = $('#users');
            var $messageForm = $('#send-message');
            var $messageBox = $('#message');
            var $chat = $('#chat');

            $nickForm.submit(function(e){
                e.preventDefault();
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
            });

            socket.on('usernames', function(data){
                var html = '';
                for (i = 0; i < data.length; i++) {
                    html += data[i] + '<br/>'
                }
                $users.html(html);
            });

            $messageForm.submit(function (e) {
                e.preventDefault();
                socket.emit('send message', $messageBox.val(), function(data){
                  document.getElementById('chat').innerHTML += "<span class='error'>" + data + "</span></br>";
                  document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
                });
                $messageBox.val('');
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
