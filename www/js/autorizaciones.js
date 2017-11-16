  var currentnode = '/autorizaciones/'+key
  , autorizacions = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition

  autorizacions.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.fadeOut, function(){
        $('.lista').delay(anim.delay).fadeIn()
      })    
    }
  })

  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val()
  })

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault()

    var data = $(this).serializeObject()
    , _key = $(this).attr('key')
    , estado = data.aprobado?1:0;

    $('.spinner').fadeIn(anim.fadeIn, function(){
      firebase.database().ref(currentnode + '/' + _key).once('value').then(function(item) {
        var autorizacion = item.val();
        var estado_ref = autorizacion.aprobado;
        autorizacion.aprobado = estado;
        firebase.database().ref(currentnode + '/' + _key).update(autorizacion, function(error){
          if(error){
            console.log(error);
          }else{
            var noti = false;
            if(!estado_ref && estado){
              noti = {
                fecha: moment().format(),
                icon : 'success',
                tipo : 'particular',
                destino : autorizacion.usuario_id,
                titulo : "La autorizacion de " + autorizacion.nombre + " para el " + LI.aux.easyDate(autorizacion.fecha) + " fue aprobada",
                texto : data.texto
              };
            } else if(estado_ref && !estado){
              noti = {
                fecha: moment().format(),
                icon : 'error',
                tipo : 'particular',
                destino : autorizacion.usuario_id,
                titulo : "La autorizacion de " + autorizacion.nombre + " para el " + LI.aux.easyDate(autorizacion.fecha) + " no fue aprobada",
                texto : data.texto
              };
            }

            if(noti){
              var notificaciones = firebase.database().ref('/notificaciones/' + key);
              notificaciones.child(notificaciones.push().key).set(noti);
            }

            $('#detail').fadeOut(anim.fadeOut,function(){
              $('.lista').fadeIn(anim.fadeIn,function(){
                //LI.resetScroll()
                $('.spinner').fadeOut(anim.fadeOut*anim.factor);
              })
            }) 
          }
        })
      })
    })

    return false  
  })

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{estado:""},aux:LI.aux.autorizacions,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
          $('body,html').scrollTop(0)
        })
      })    
    })  
  })

  $(document).on('click','.action.ver',function(){
    var _key = $(this).data('key')
    $('body').attr('key',_key)
    LI.setScroll()
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  
      firebase.database().ref(currentnode +'/'+_key).once('value').then(function(item) {
        firebase.database().ref('/cuentas/'+key+'/'+item.val().usuario_id).once('value').then(function(cuenta) {
          $('#detail').html($.templates('#form').render({key:item.key,data:item.val(),cuenta:cuenta.val(),datosdeapoyo:datosdeapoyo},LI.aux)).promise().done(function(){
            $('.lista').fadeOut(anim.fadeOut,function(){
              $('.spinner').fadeOut(anim.fadeOut*anim.factor,function(){                    
                $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
                  $('body,html').scrollTop(0)
                })
              })
            })
          })
        })
      })
    })
  })

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
        swal.close()
      })
    })
  })  

  $(document).on('click','.cerrar',function(){
    $('#detail').fadeOut(anim.fadeOut,function(){
      $('.lista').delay(anim.delay).fadeIn(anim.fadeIn,function(){
        LI.resetScroll()
      })
    })
  })  

  // live fb handlers
  autorizacions.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
    $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
      $('.lista').delay(anim.delay).fadeIn()
    })
  })

  autorizacions.on('child_changed', (data) => {
    var index = $('#'+data.key).index()
    $('#'+data.key).remove()
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}, LI.aux))
    $('#'+data.key).animateChanged()
  })

  autorizacions.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove()  
    })    
  })