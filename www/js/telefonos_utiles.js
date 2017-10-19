  var currentnode = '/telefonos_utiles/'+key
  , telefonos_utiles = firebase.database().ref(currentnode)
  , datosdeapoyo = {}  
  , anim = LI.animation.transition

  telefonos_utiles.once('value').then(function(datos) {
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
    , updates = {}
    , _key = $(this).attr('key')

    data.estado = data.estado?1:0;
    updates[currentnode +'/' + _key] = data

    $('.spinner').fadeIn(anim.fadeIn, function(){
      firebase.database().ref().update(updates, function(error){
        if(error){
          console.log(error)
        }else{
          $('#detail').fadeOut(anim.fadeOut,function(){
            $('.lista').fadeIn(anim.fadeIn,function(){
              //LI.resetScroll()
              $('.spinner').fadeOut(anim.fadeOut*anim.factor)
            })
          }) 
        }
      })
    })

    return false  
  })

  $(document).on('click','.add-item',function(e){
    $('#detail').html($.templates('#form').render({key:null,data:{estado:""},aux:LI.aux,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
      $('.lista').fadeOut(anim.fadeOut,function(){
        $('#detail').delay(200).fadeIn(anim.fadeOut*anim.factor,function(){
          $('body,html').scrollTop(0)
        })
      })    
    })  
  })

  $(document).on('click','.action.ver',function(){
    var key = $(this).data('key')
    $('body').attr('key',key)
    LI.setScroll()
    $('.spinner').fadeIn(anim.fadeIn*anim.factor, function(){  
      firebase.database().ref(currentnode +'/'+key).once('value').then(function(item) {
        $('#detail').html($.templates('#form').render({key:item.key,data:item.val(),aux:LI.aux,datosdeapoyo:datosdeapoyo},LI)).promise().done(function(){
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
  telefonos_utiles.on('child_added', (data) => {
    $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
    $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
      $('.lista').delay(anim.delay).fadeIn()
    })
  })

  telefonos_utiles.on('child_changed', (data) => {
    var index = $('#'+data.key).index()
    $('#'+data.key).remove()
    $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}))
    $('#'+data.key).animateChanged()
  })

  telefonos_utiles.on('child_removed', (data) => {
    $('#'+data.key).animateRemoved(function(){
      $(this).remove()  
    })    
  })