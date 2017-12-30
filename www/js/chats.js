  var node = location.hash.split(':')[0]
  , node = node.replace('#','')
  , currentnode = '/chat_mensajes/'+node
  , chat_mensajes = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition
  , show = function(_key){

    _key = _key.replace(node+':','');
    $('body').attr('key',_key);
    LI.setScroll();
    var users = [];
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  

      var userkey1 = _key.split('_')[0];
      var userkey2 = _key.split('_')[1];

     firebase.database().ref('cuentas/'+node+'/'+userkey1).once('value').then(function(user1) {
        users[user1.key]= user1.val();

        firebase.database().ref('cuentas/'+node+'/'+userkey2).once('value').then(function(user2) {
          users[user2.key] = user2.val();

          firebase.database().ref(currentnode +'/'+_key).once('value').then(function(chats) {
            var data = [];

            chats.forEach(function(chat){
              var item = chat.val();
              item.sender = users[item.from];
              data.push(item);
            });

            $('#detail').html($.templates('#form').render({key:chats.key,data:data,userkey:userkey1},LI)).promise().done(function(){
              $('.lista').fadeOut(anim.fadeOut,function(){
                $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){                    
                  $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
                    $('body,html').scrollTop(0);
                  })
                });
              });
            });              
          });
        });
      });
    });    
  };

  chat_mensajes.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn();
      });
    }
  });

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val();
  });

  $(document).on('click','.cerrar',function(){
    location.hash=node;
  });  

  $(function(){
    $(window).on('hashchange', function(){
      if(location.hash.indexOf(':') > -1) {
        show(location.hash.replace('#',''));
      } else {
        $('#detail').fadeOut(anim.fadeOut,function(){
          $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
            LI.resetScroll();
          });
        });
      }
    }).trigger('hashchange');
  });

  // live fb handlers
  chat_mensajes.on('child_added', (data) => {

    var item = data.val();
    var itemKey = data.key;
    var user1 = {};
    var user2 = {};
    var user1Key = itemKey.split('_')[0];
    var user2Key = itemKey.split('_')[1];

    firebase.database().ref('/cuentas/'+node+'/'+user1Key).once('value').then(function(user1) {
      user1 = user1.val();
      firebase.database().ref('/cuentas/'+node+'/'+user2Key).once('value').then(function(user2) {
        user2 = user2.val();
        $('#list').prepend($.templates('#item').render({node:node,key:itemKey,user1:user1,user2:user2}, LI.aux)).promise().done(function(){
          $('#list').find('#'+data.key).animateAdded();
        });
      });
    });
    if(location.hash.indexOf(':') == -1){
      $('.spinner').fadeOut(anim.fadeOut);
    } 
  });

  chat_mensajes.on('child_changed', (data) => {
    var index = $('#'+data.key).index();
    $('#'+data.key).remove();
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}, LI.aux));
    $('#'+data.key).animateChanged();
  });

  chat_mensajes.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove();
    });  
  });