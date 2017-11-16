var paginas = firebase.database().ref('/paginas')
, anim = LI.animation.transition

$(document).on('submit','#firebase-form',function(e){
  e.preventDefault()
  
  var data = $(this).serializeObject()
  , updates = {}
  , key = data.tag 

  if(!data.tag){
    return swal("Se necesitan mas datos", "Ingresa etiqueta","warning")
  }

  delete data.tag 
    
  updates['/paginas/' + key] = data

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

$(document).on('click','.add-pagina',function(e){
  $('#detail').html($.templates('#form').render({key:null,data:{aprobado:""},aux:LI.aux.paginas},LI)).promise().done(function(){
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
    firebase.database().ref('paginas/'+key).once('value').then(function(pagina) {
      $('#detail').html($.templates('#form').render({key:pagina.key,data:pagina.val(),aux:LI.aux.paginas},LI)).promise().done(function(){
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
    title: "Borrar página",   
    text: "Seguro que querés eliminar esta página?",
    type: "warning",
    showCancelButton: true,   
    closeOnConfirm: false,   
    showLoaderOnConfirm: true,
  }, function(){    
    firebase.database().ref('paginas/' + key).remove().then(function(){
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
paginas.on('child_added', (data) => {
  $('#list').prepend($.templates('#item').render({key:data.key,data:data.val()}, LI.aux.paginas)).promise().done(function(){
    $('#list').find('#'+data.key).animateAdded()
  })  
  $('.spinner').fadeOut(anim.fadeOut*anim.factor, function(){
    $('.lista').delay(anim.delay).fadeIn()
  })
})

paginas.on('child_changed', (data) => {
  var index = $('#'+data.key).index()
  $('#'+data.key).remove()
  $('#list').insertAt(index, $.templates('#item').render({key:data.key,data:data.val()}))
  $('#'+data.key).animateChanged()
})

paginas.on('child_removed', (data) => {
  $('#'+data.key).animateRemoved(function(){
    $(this).remove()  
  })    
})