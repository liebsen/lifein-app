function runExample(demoUrl) {
    "use strict";
    
    var uid = null, room = null, submitted = false, sub = null, members = {}, userName;
    var ref = new Firebase(demoUrl);
    var $inp = $('input[name=data]');
    var $join = $('#joinForm');
    
    // handle input and form events
    $('#chatForm').submit(processForm);
    $inp.on('keyup', _.debounce(countChars, 50));
    $('#login').click(authenticate);
    $('a[href="#logout"]').click(logout);
    $('a[href="#leave"]').click(leaveRoom);
    $join.submit(joinRoom);
    
    function authenticate(e) {
        e.preventDefault();
        ref.authWithOAuthPopup('github', function(err, user) {
            if (err) {
                console.log(err, 'error');
            } else if (user) {
                // logged in!
                uid = user.uid;
                console.log('logged in with id', uid);
                $('#login-layer').hide();
                ref.child('room_names').once('value', buildRoomList);
            } else {
                // logged out
                $('#login-layer').show();
            }
        });
    }
    
    function logout(e) {
       e.preventDefault();
       ref.unauth();
    }

    // create option tags in our room select
    function buildRoomList(snap) {
        var $sel = $('select').empty();
        snap.forEach(function (ss) {
            $('<option />')
                .prop('value', ss.name())
                .text(ss.val())
                .appendTo($sel);
        });
        pickRoom();
        $sel.change(pickRoom);
    }

    // when the select is updated, load that room's messages
    function pickRoom() {
        roomOff();
        $('#chatForm').hide();
        var roomId = $('select').val();
        
        // see if we need to join or if we are already a member
        // by trying to load the list of members
        getMembers(roomId).then(loadRoom, showJoinForm);
    }
    
    function getMembers(roomId) {
        return $.Deferred(function(def) {
           // try to read the room's members, if we succeed
           // then we are a member
           ref.child('members').child(roomId)
           .once('value', function(snap) {
               members = snap.val() || {};
               if( !members.hasOwnProperty(uid) ) {
                  def.reject();
               }
               else {
                  setName(members[uid]);
                  def.resolve();   
               }
           }, def.reject);
        });
    }
    
    function showJoinForm() {
        console.log('showJoinForm');
       var $ul = emptyRoom();
       $('<li>You are not a member of this room</li>').appendTo($ul);
       var $li = $('<li />').append($join.show()).appendTo($ul);
    }
    
    function joinRoom(e) {
       e.preventDefault();
       var roomId = $('select').val();
       var name = $(this).find('input').val();
        if( name ) {
            setName(name);
            ref.child('members').child(roomId).child(uid).set(name, function(err) {
                if( err ) { log(err, 'error'); }
                else {
                   getMembers(roomId).then(loadRoom, result);   
                }
            });
        }
        else {
           log('Enter a name', 'error');   
        }
    }
    
    function leaveRoom(e) {
       e.preventDefault();
       roomOff();
       var roomId = $('select').val();
       ref.child('members').child(roomId).child(uid).remove(pickRoom);
    }
    
    function roomOff() {
       if( room ) { 
            // stop listening to the previous room
            room.off('child_added', newMessage);
            room.off('child_removed', dropMessage);
        }   
    }
    
    function loadRoom() {
        emptyRoom();
        $('#chatForm').show();
        room = ref.child('messages').child($('select').val()).limit(100);   
        room.on('child_added', newMessage);
        room.on('child_removed', dropMessage);   
    }
    
    function emptyRoom() {
        $join.detach();
        return $('ul.chatbox').empty();
    }
    
    function setName(name) {
       userName = name;
       members[name] = name;
       $('#chatForm').find('button').text('Send as '+name);
    }
    
    // create a new message in the DOM after it comes
    // in from the server (via child_added)
    function newMessage(snap) {
        var $chat = $('ul.chatbox');
        var dat = snap.val();
        var txt = members[dat.user] + ': ' + dat.message;
        $('<li />').attr('data-id', snap.name()).text(txt).appendTo($chat); 
        $chat.scrollTop($chat.height());
    }
    
    // remove message locally after child_removed
    function dropMessage(snap) {
        $('li[data-id="'+snap.name()+'"]').remove();
    }

    // print results of write attempt so we can see if
    // rules allowed or denied the attempt
    function result(err) {
        if (err) {
            log(err.code, 'error');
        } else {
            log('success!');
        }
    }

    // post the forms contents and attempt to write a message
    function processForm(e) {
        e.preventDefault();
        submitted = true;
        var val = $inp.val();
        $inp.val(null);
        if (!userName) {
            log('No username :(', 'error');
        } else {
            room.ref().push({
                user: uid,
                message: val,
                timestamp: Firebase.ServerValue.TIMESTAMP
            }, result);
        }
    }
        
    // tell user how many characters they have entered
    function countChars() {
        var len = $(this).val().length;
        if( len || !submitted ) {
            var style = len >= 50 ? 'error' : 'note';
            log(len + ' characters', style);
        }
        return true;
    }

    // print write results
    function log(text, style) {
        delayedClear();
        var $p = $('p.result').removeClass('error note success');
        style && $p.addClass(style);
        $p.text(text);
    }

    var to;

    // clear write results after 5 seconds
    function delayedClear() {
        to && clearTimeout(to);
        to = setTimeout(clearNow, 5000);
    }

    // clear write results now
    function clearNow() {
        $('p.result').text('');
        to && clearTimeout(to);
        to = null;
        submitted = false;
    }

}


// Dependencies used in this fiddle:
// code.jquery.com/jquery-2.1.0.min.js
// cdn.firebase.com/js/client/2.0.4/firebase.js
// cdn-gh.firebase.com/demo-utils-script/demo-utils.js
// cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js
//
// This line creates a unique, private Firebase URL 
// you can hack in! Have fun!
$.loadSandbox('web/usec/example', 'web/usec/example').then(runExample);   