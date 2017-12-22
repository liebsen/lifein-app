  var currentnode = '/notificaciones/'+key
  , notificaciones = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition
  , showItem = function(_key){
    $('body').attr('key',_key);
    LI.setScroll();
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  
      firebase.database().ref(currentnode +'/'+_key).once('value').then(function(item) {
        firebase.database().ref('/cuentas/'+key+'/'+item.val().destino).once('value').then(function(cuenta) {
          $('#detail').html($.templates('#form').render({key:item.key,data:item.val(),user:cuenta.val(),aux:LI.aux,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
            $('.lista').fadeOut(anim.fadeOut,function(){
              $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){                    
                $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
                  $('body,html').scrollTop(0);
                });
              });
            });
          });
        });
      });
    }); 
  };  

  notificaciones.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn();
      });
    }
  });

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val();
  });

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault()
    
    var data = $(this).serializeObject()
    , updates = {}
    , key = $(this).attr('key');

    data.aprobado = data.aprobado?1:0;

    if(key){
      updates[currentnode +'/' + key] = data;
    } else {
      var newKey = notificaciones.push().key;
      key = newKey;
      updates[currentnode + '/' + key] = data;
    }

    $('.spinner').fadeIn(anim.fadeIn, function(){
      firebase.database().ref().update(updates, function(error){
        if(error){
          console.log(error);
        }else{
          LI.resetScroll();
          $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){
            location.hash = '';
          });
        }
      });
    });

    return false;
  });

  $(document).on('click','.action.eliminar',function(){
    var key = $(this).data('key')
    swal({   
      title: "Borrar reserva",   
      text: "Seguro que querés eliminar esta reserva?",
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      firebase.database().ref(currentnode + key).remove().then(function(){
        swal.close();
      });
    });
  });

  $(document).on('click','.cerrar',function(){
    location.hash="";
  });  

  $(document).on('click','.users-close',function(e){
    $('.list-users-backdrop').fadeOut();
  });

  $(document).on('keyup','.users-filter',function(e){
    var filter = $(this).val();
    $('.list-users div').each(function(){
      if($(this).text().indexOf(filter) > -1){
        $(this).fadeIn(100);
      } else {
        $(this).fadeOut(100);
      }
    })
  });

  $(document).on('click','.custom-list-user',function(e){
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    var userKey = $(this).data('key');
    $('input[name="destino"]').val(userKey);
    $('.list-users-backdrop').fadeOut();
  });

  $(document).on('click','.select-user',function(e){
    firebase.database().ref('/cuentas/' + key).once('value', function(cuenta) {
      var data = cuenta.val();
      $('.list-users').html($.templates('#list_users').render({data:data,selected:$('input[name="destino"]').val()},LI.aux)).promise().done(function(){  
        $('.list-users-backdrop').fadeIn();
      });
    });
  });

  $(function(){
    $(window).on('hashchange', function(){
      if(location.hash == '#add') {
        $('#detail').html($.templates('#form').render({key:null,data:null,datosdeapoyo:datosdeapoyo},LI.aux)).promise().done(function(){
          $('.lista').fadeOut(anim.fadeOut,function(){
            $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
              $('.spinner').fadeOut(anim.fadeIn*anim.factor, function(){  
                $('body,html').scrollTop(0);
              });
            });
          });   
        });
      } else if(location.hash != '') {
        showItem(location.hash.replace('#',''));
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
  notificaciones.on('child_added', (data) => {
    var item = data.val();
    firebase.database().ref('/cuentas/'+key+'/'+item.destino).once('value').then(function(cuenta) {
      $('#list').prepend($.templates('#item').render({key:data.key,data:item,user:cuenta.val()}, LI.aux)).promise().done(function(){
        $('#list').find('#'+data.key).animateAdded();
      });
    });
    if(location.hash===''){
      $('.spinner').fadeOut(anim.fadeOut);
    }   
  });

  notificaciones.on('child_changed', (data) => {
    var index = $('#'+data.key).index();
    $('#'+data.key).remove();
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}));
    $('#'+data.key).animateChanged();
  });

  notificaciones.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove();
    });
  });