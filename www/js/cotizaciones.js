var cotizaciones = firebase.database().ref('/cotizaciones')
, anim = helper.animation

$(document).on('submit','#firebase-form',function(e){
  e.preventDefault()
  
  var data = $(this).serializeObject()
  , updates = data
  , comentario = {}
  , comentarios = []  
  , key = $(this).attr('key')

  if(!data.cotizacion && !data.comentario && !data.precio){
    return swal("Se necesitan mas datos", "Ingresa cotización o comentario","warning")
  }

  if(data.comentario){

    var user = localStorage.getItem("firebaseuser")
    , user = $.parseJSON(user)

    comentario.fecha = moment().toISOString();
    comentario.comentario = data.comentario;
    comentario.autor = user.displayName;

    // sync down from server
    cotizaciones.child(key).on('value', function(snap) { comentarios = snap.val().comentarios || [] });
    
    comentarios.push(comentario);
    cotizaciones.child(key + '/comentarios').set(comentarios);
  }

  delete updates.comentario

  for( var i in updates){
    if(i.indexOf('[') > -1){
      var j = i.split('[').join('').split(']').join('')
     
      for(var a in updates[i]){
        if($.trim(updates[i][a])==""){
          delete updates[i][a]
        }
      }
      updates[j] = updates[i]
      delete updates[i]
    }
  }

  if(data.cotizacion || data.precio) {
    updates['fecha'] = moment().toISOString()
  }

  $('.spinner').fadeIn(anim.transition.fadeIn, function(){
    cotizaciones.child(key).update(updates, function(error){
      if(error){
        console.log(error)
      }else{
        $('#detail').fadeOut(anim.transition.fadeOut,function(){
          $('.lista').delay(200).fadeIn(anim.transition.fadeIn,function(){
            helper.resetScroll()
            $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor)
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
    title: "Borrar cotización",   
    text: "Seguro que querés eliminar esta cotización?",   
    type: "warning",
    showCancelButton: true,   
    closeOnConfirm: false,   
    showLoaderOnConfirm: true,
  }, function(){    
    firebase.database().ref('cotizaciones/' + key).remove().then(function(){
      swal.close()
    })
  })
})

$(document).on('click','.responder',function(){
  var key = $(this).data('key')
  $('body').attr('key',key)
  helper.setScroll()
  $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){
    firebase.database().ref('cotizaciones/'+key).once('value').then(function(item) {
      $('#detail').html($.templates('#form').render({key:item.key,data:item.val()},helper.aux.cotizaciones)).promise().done(function(){
        $('.lista').fadeOut(anim.transition.fadeOut,function(){
          $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){          
            $('#detail').fadeIn(anim.transition.fadeIn,function(){
              $('body,html').scrollTop(0)
            })
          })
        })
      })
    })
  })
})

$(document).on('click','.unlock-response',function(){
  var that = this
  , sent = $('#'+$('body').attr('key')).find('.responder').data('sent')
  , sent_date = moment(sent).toISOString()
  swal({   
    title: "Desbloquear",   
    text: "Esta cotización ha sido respondida el día (" + sent_date + "). Seguro que querés editarla?",
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

$(document).on('click','.cerrar',function(){
  $('#detail').fadeOut(anim.transition.fadeOut,function(){
    $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn,function(){
      helper.resetScroll()
    })
  })
})

// live firebase handlers
cotizaciones.on('child_added', (data) => {
  var item = data.val()
  , obj = {key:data.key,data:item}
  $('#list').prepend($.templates('#item').render(obj,helper.aux.cotizaciones)).promise().done(function(){
    $('#list').find('#'+data.key).animateAdded()
  })  
  if(item.cotizacion == undefined && item.precio == undefined){
    $('#list1').prepend($.templates('#item').render(obj,helper.aux.cotizaciones)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })
  }
  $('.spinner').fadeOut(anim.transition.fadeOut, function(){
    $('.lista').delay(anim.transition.delay).fadeIn()
  })
})

cotizaciones.on('child_changed', (data) => {
  var index = $('#list').find('#'+data.key).index()
  $('#list1').find('#'+data.key).remove()
  $('#list').find('#'+data.key).remove()
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()},helper.aux.cotizaciones))
  $('#list').find('#'+data.key).animateChanged()
})

cotizaciones.on('child_removed', (data) => {
  $('#'+data.key).animateRemoved(function(){
    $(this).remove()  
  })  
})