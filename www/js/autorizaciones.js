  var currentnode = '/autorizaciones/'+key
  , autorizaciones = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition
  , show = function(_key){
    LI.setScroll()
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  
      firebase.database().ref(currentnode +'/'+_key).once('value').then(function(item) {
        firebase.database().ref('/cuentas/'+key+'/'+item.val().usuario_id).once('value').then(function(cuenta) {
          $('#detail').html($.templates('#form').render({key:item.key,data:item.val(),cuenta:cuenta.val(),datosdeapoyo:datosdeapoyo},LI.aux)).promise().done(function(){
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

  autorizaciones.once('value').then(function(datos) {
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
    e.preventDefault();

    var data = $(this).serializeObject()
    , _key = $(this).attr('key')
    , aprobado = data.aprobado?1:0;

    $('.spinner').fadeIn(anim.fadeIn, function(){
      firebase.database().ref(currentnode + '/' + _key).once('value').then(function(item) {
        var entry = item.val();
        var aprobado_ref = entry.aprobado;
        entry.aprobado = aprobado;
        firebase.database().ref(currentnode + '/' + _key).update(entry, function(error){
          if(error){
            console.log(error);
          }else{
            LI.notify({
              status_ref:aprobado_ref||0,
              status:aprobado,
              type:'notificacion',
              user_id:entry.usuario_id,
              title:"Autorización",
              text:data.comment
            });

            LI.resetScroll();
            $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){
              location.hash = '';
            });
          }
        });
      });
    });

    return false;
  });

  $(document).on('click','.action.eliminar',function(){
    var key = $(this).data('key')
    swal({   
      title: "Borrar autorizacion",   
      text: "Seguro que querés eliminar esta autorizacion?",
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

  $(function(){
    $(window).on('hashchange', function(){
      if(location.hash != '') {
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
  autorizaciones.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded();
    });
    if(location.hash===''){
      $('.spinner').fadeOut(anim.fadeOut);
    } 
  });

  autorizaciones.on('child_changed', (data) => {
    var index = $('#'+data.key).index();
    $('#'+data.key).remove();
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}, LI.aux));
    $('#'+data.key).animateChanged();
  });

  autorizaciones.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove();
    });
  });