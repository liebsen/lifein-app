var consultas = firebase.database().ref('/consultas')
, anim = helper.animation

$(document).on('submit','#firebase-form',function(e){
  e.preventDefault()
  
  var data = $(this).serializeObject()
  , updates = {}
  , comentario = {}
  , comentarios = []
  , key = $(this).attr('key')
  
  if(data.respuesta) {
    updates['/consultas/' + key + '/fecha'] = moment().toISOString()
    updates['/consultas/' + key + '/respuesta'] = data.respuesta
  }

  if(data.comentario){

    var user = localStorage.getItem("firebaseuser")
    , user = $.parseJSON(user)

    comentario.fecha = moment().toISOString()
    comentario.comentario = data.comentario
    comentario.autor = user.displayName

    // sync down from server
    consultas.child(key).on('value', function(snap) { comentarios = snap.val().comentarios || [] })
    comentarios.push(comentario);
    consultas.child(key + '/comentarios').set(comentarios)
  }

  $('.mj-spinner').fadeIn(anim.transition.fadeOut*anim.transition.factor, function(){
    firebase.database().ref().update(updates, function(error){
      if(error){
        console.log(error)
      }else{
        $('#detail').fadeOut(anim.transition.fadeOut,function(){
          $('.lista').delay(200).fadeIn(anim.transition.fadeOut*anim.transition.factor,function(){
            helper.resetScroll()
            $('.mj-spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor)
          })          
        }) 
      }
    })
  })

  return false  
})

$(document).on('click','.action.eliminar',function(){
  var key = $(this).data('key')
  swal({   
    title: "Borrar consulta",   
    text: "Seguro que querés eliminar esta consulta?",   
    type: "warning",
    showCancelButton: true,   
    closeOnConfirm: false,   
    showLoaderOnConfirm: true,
  }, function(){    
    firebase.database().ref('consultas/' + key).remove().then(function(){
      swal.close()
    })
  })
})

$(document).on('click','.responder',function(){
  var key = $(this).data('key')
  $('body').attr('key',key)
  helper.setScroll()
  $('.mj-spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){  
    firebase.database().ref('consultas/'+key).once('value').then(function(item) {
      $('#detail').html($.templates('#form').render({key:item.key,data:item.val()},helper.aux.consultas)).promise().done(function(){
        $('.lista').fadeOut(anim.transition.fadeOut,function(){
          $('.mj-spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){                    
            $('#detail').delay(200).fadeIn(anim.transition.fadeIn,function(){
              $('body,html').scrollTop(0)
            })
          })
        })
      })
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

$(document).on('click','.unlock-response',function(){
  var sent = $('#'+$('body').attr('key')).find('.responder').data('sent')
  , that = this
  swal({   
    title: "Desbloquear",   
    text: "Esta respuesta ya ha sido enviada el día (" + sent + "). Seguro que querés editarla?",
    type: "warning",
    showCancelButton: true,   
    closeOnConfirm: false,   
    showLoaderOnConfirm: true,
  }, function(){
    swal.close()
    $('.enableifdisabled').prop('disabled',false).focus()
    $(that).removeClass('buttongreen unlock-response')
      .attr('type','submit')
      .val('Responder')
  })    
})


// live firebase handlers
consultas.on('child_added', (data) => {
  var item = data.val()
  , obj = {key:data.key,data:item}

  $('#list').prepend($.templates('#item').render(obj)).promise().done(function(){
    $('#list').find('#'+data.key).animateAdded()
  })  

  if(item.respuesta == undefined){
    $('#list1').prepend($.templates('#item').render(obj)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })  
  }
  
  $('.mj-spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
    $('.lista').delay(anim.transition.delay).fadeIn()
  })
})

consultas.on('child_changed', (data) => {
  var index = $('#list').find('#'+data.key).index()
  $('#list1').find('#'+data.key).remove()
  $('#list').find('#'+data.key).remove()
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}))
  $('#list').find('#'+data.key).animateChanged()
})

consultas.on('child_removed', (data) => {
  $('#'+data.key).animateRemoved(function(){
    $(this).remove()  
  })  
})