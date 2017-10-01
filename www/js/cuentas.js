  var currentnode = '/cuentas/' + key
  , cuentas = firebase.database().ref(currentnode)
  , datosdeapoyo = {}
  , anim = LI.animation

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
    , newKey = undefined 
    , key = $(this).attr('key')

    data.geo = { 
      lat: $('#direccion').attr('lat')
      , lng : $('#direccion').attr('lng') 
    }

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
          if(newKey){
            var emailData = data
            emailData.password = LI.randomString(12)
            LI.createAccount('email',emailData).then(function(){
              $('#detail').fadeOut(anim.transition.fadeOut,function(){
                $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
                  LI.resetScroll()
                  $('.spinner').fadeOut(anim.transition.fadeOut)
                })
              }) 
            })
          } else {             
            $('#detail').fadeOut(anim.transition.fadeOut,function(){
              $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
                LI.resetScroll()
                $('.spinner').fadeOut(anim.transition.fadeOut)
              })
            }) 
          }
        }
      })
    })

    return false  
  })

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{plan:""},datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.transition.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
          $('body,html').scrollTop(0)
          LI.initAutocomplete('direccion')
        })
      })    
    })  
  })

  $(document).on('click','.action.ver',function(){
    var key = $(this).data('key')
    $('body').attr('key',key)
    LI.setScroll()
    $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
      firebase.database().ref(currentnode+'/'+key).once('value').then(function(cuenta) {
        var data = cuenta.val()
        $('#detail').html($.templates('#form').render({key:cuenta.key,data:data,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
          $('.lista').fadeOut(anim.transition.fadeOut,function(){
            $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){
              $('#detail').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
                LI.initAutocomplete('direccion')
                if(data.geo){
                  $('#implementacion_direccion')
                    .attr('lat',data.geo.lat)
                    .attr('lng',data.geo.lng)
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
        LI.resetScroll()
      })
    })
  })  

  // live fb handlers
  cuentas.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI)).promise().done(function(){
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