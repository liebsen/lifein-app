var audios = firebase.database().ref('/audios')
, anim = helper.animation
helper.aux.audios.check = function(src){
  var path = src.split("?")[0]
  , extension = path.substring(path.lastIndexOf('.') + 1)
  if(Modernizr.audio[extension]){
    return '<audio controls><source src="'+src+'">Your browser does not support the audio element.</audio><br><a href="'+src+'">Descargar audio</a>'
  }else{
    return '<audio preload="auto" controls><source src="'+src+'"></audio><br><a href="'+src+'">Descargar audio</a>'
    setTimeout(function(){

      audiojs.events.ready(function() {
          audiojs.createAll()
      })
    },400)
  }
}

$(document).on('submit','#firebase-form',function(e){
  e.preventDefault()
  
  var data = $(this).serializeObject()
  , updates = {}
  , comentario = {}
  , comentarios = []
  , key = $(this).attr('key')
  
  if(data.respuesta) updates['/audios/' + key + '/respuesta'] = data.respuesta

  if(data.comentario){

    var user = localStorage.getItem("firebaseuser")
    , user = $.parseJSON(user)

    comentario.fecha = moment().toISOString()
    comentario.comentario = data.comentario
    comentario.autor = user.displayName

    // sync down from server
    audios.child(key).on('value', function(snap) { comentarios = snap.val().comentarios || [] })
    comentarios.push(comentario);
    audios.child(key + '/comentarios').set(comentarios)
  }

  $('.spinner').fadeIn(anim.transition.fadeIn, function(){
    firebase.database().ref().update(updates, function(error){
      if(error){
        console.log(error)
      }else{
        $('#detail').fadeOut(anim.transition.fadeOut,function(){
          $(this).html("") // reset audio
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

$(document).on('click','.responder',function(){
  var key = $(this).data('key')
  $('body').attr('key',key)
  helper.setScroll()
  $('.spinner').fadeIn(anim.transition.fadeIn*anim.transition.factor, function(){  
    firebase.database().ref('audios/'+key).once('value').then(function(item) {
      $('#detail').html($.templates('#form').render({key:item.key,data:item.val()},helper.aux.audios)).promise().done(function(){
        $('.lista').fadeOut(anim.transition.fadeOut,function(){
          $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor,function(){                    
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
    $(this).html("") // reset audio
    $('.lista').delay(200).fadeIn(anim.transition.fadeIn,function(){
      helper.resetScroll()
    })
  })
})

// live firebase handlers
audios.on('child_added', (data) => {
  var item = data.val()
  , obj = {key:data.key,data:item}

  $('#list').prepend($.templates('#item').render(obj,helper.aux.audios)).promise().done(function(){
    $(this).find('#'+data.key).animateAdded()  
  })

  if(item.respuesta == undefined){
    $('#list1').prepend($.templates('#item').render(obj,helper.aux.audios)).promise().done(function(){
      $('#list').find('#'+data.key).animateAdded()
    })
  }
  
  $('.spinner').fadeOut(anim.transition.fadeOut*anim.transition.factor, function(){
    $('.lista').delay(anim.transition.delay).fadeIn(anim.transition.fadeIn)
  })
})

audios.on('child_changed', (data) => {
  var index = $('#list').find('#'+data.key).index()
  $('#list1').find('#'+data.key).remove()
  $('#list').find('#'+data.key).remove()
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()},helper.aux.audios))
  $('#list').find('#'+data.key).animateChanged()
})

audios.on('child_removed', (data) => {
  $('#'+data.key).animateRemoved(function(){
    $(this).remove()  
  })  
})
