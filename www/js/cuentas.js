  var currentnode = '/cuentas/' + key
  , cuentas = firebase.database().ref(currentnode)
  , datosdeapoyo = {}
  , anim = helper.animation

  cuentas.once('value').then(function(datos) {
    if(!datos.val()){
      $('.spinner').fadeOut(anim.transition.fadeOut, function(){
        $('.lista').delay(anim.transition.delay).fadeIn()
      })    
    }
  })
    
  firebase.database().ref('/datosdeapoyo').once('value').then(function(datos) {
    datosdeapoyo = datos.val()
  })

  $(document).on('submit','#firebase-form',function(e){
    e.preventDefault()
    var data = $(this).serializeObject()
    , updates = {}
    , key = $(this).attr('key')

    delete data.contacto_email
    delete data.contacto_telefono
    delete data.contacto_empresa
    delete data.contacto_cuentas
    delete data.contacto_empleados

    if(key){
      updates[currentnode + '/' + key] = data
    } else {
      var newKey = cuentas.push().key
      updates[currentnode + '/' + newKey] = data
    }

    $('.spinner').fadeIn(anim.transition.fadeIn, function(){
      firebase.database().ref().update(updates, function(error){
        if(error){
          console.log(error)
        }else{
          $('#detail').fadeOut(anim.transition.fadeOut,function(){
            $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
              helper.resetScroll()
              $('.spinner').fadeOut(anim.transition.fadeOut)
            })
          }) 
        }
      })
    })

    return false  
  })

  $(document).on('click','.add-cuenta',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{plan:""},datosdeapoyo:datosdeapoyo},helper)).promise().done(function(){
      $('.lista').fadeOut(anim.transition.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
          $('body,html').scrollTop(0)
        })
      })    
    })  
  })

  $(document).on('click','.action.ver',function(){
    var key = $(this).data('key')
    $('body').attr('key',key)
    helper.setScroll()
    $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
      firebase.database().ref(currentnode+'/'+key).once('value').then(function(cuenta) {
        $('#detail').html($.templates('#form').render({key:cuenta.key,data:cuenta.val(),datosdeapoyo:datosdeapoyo},helper)).promise().done(function(){
          $('.lista').fadeOut(anim.transition.fadeOut,function(){
            $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
              $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
                $('body,html').scrollTop(0)
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
      title: "Borrar cuenta",   
      text: "Seguro que querés eliminar esta cuenta?",   
      type: "warning",
      showCancelButton: true,   
      closeOnConfirm: false,   
      showLoaderOnConfirm: true,
    }, function(){    
      firebase.database().ref(currentnode + '/' + key).remove().then(function(){
        swal.close()
      })
    })
  })  

  $(document).on('click','.cerrar',function(){
    $('#detail').fadeOut(anim.transition.fadeOut,function(){
      $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
        helper.resetScroll()
      })
    })
  })  

  // live fb handlers
  cuentas.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, helper)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
    $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
      $('.lista').delay(anim.transition.delay).fadeIn()
    })  
  })

  cuentas.on('child_changed', (data) => {
    var index = $('#'+data.key).index()
    $('#'+data.key).remove()
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}))
    $('#'+data.key).animateChanged()
  })

  cuentas.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove()  
    })  
  })