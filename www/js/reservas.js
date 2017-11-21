  var currentnode = '/reservas/'+key
  , reservas = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition;

  reservas.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn();
      })    
    }
  })

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val();
  })

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
              title:"Reserva",
              text:data.comment
            });            

            $('#detail').fadeOut(anim.fadeOut,function(){
              $('.lista').fadeIn(anim.fadeIn,function(){
                //LI.resetScroll()
                $('.spinner').fadeOut(anim.fadeOut*anim.factor);
              });
            });
          }
        });
      });
    });

    return false;
  });

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{aprobado:""},datosdeapoyo:datosdeapoyo},LI.aux)).promise().done(function(){
      $('.lista').fadeOut(anim.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
          $('body,html').scrollTop(0);
        })
      })    
    })  
  })

  $(document).on('click','.action.ver',function(){
    var _key = $(this).data('key')
    $('body').attr('key',key)
    LI.setScroll()
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  
      firebase.database().ref(currentnode +'/'+_key).once('value').then(function(item) {
        firebase.database().ref('/cuentas/'+key+'/'+item.val().usuario_id).once('value').then(function(cuenta) {
          console.log(cuenta.val())
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
  });

  $(document).on('click','.action.eliminar',function(){
    var key = $(this).data('key');
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
      })
    })
  })  

  $(document).on('click','.cerrar',function(){
    $('#detail').fadeOut(anim.fadeOut,function(){
      $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
        LI.resetScroll();
      })
    })
  })  

  // live fb handlers
  reservas.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
    $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
      $('.lista').delay(anim.delay).fadeIn();
    })
  })

  reservas.on('child_changed', (data) => {
    var index = $('#'+data.key).index();
    $('#'+data.key).remove();
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}, LI.aux));
    $('#'+data.key).animateChanged();
  })

  reservas.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove();
    })    
  })